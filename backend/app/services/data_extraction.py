import os
import re
import torch
import numpy as np
import fitz
import cv2
import pytesseract

from collections import defaultdict
from transformers import AutoModelForTokenClassification, AutoTokenizer
from PIL import Image
from openai import OpenAI

class DataExtraction:
    def __init__(self):

        self.question_answer_dict = defaultdict(list)
        
        self.label_list = ["O", "B-QUESTION", "I-QUESTION", "B-ANSWER", "I-ANSWER"]
        self.id_to_label_dict = dict(enumerate(self.label_list))

        model_dir = os.path.join(os.path.dirname(__file__), "..", "inference_model")

        self.tokenizer = AutoTokenizer.from_pretrained(model_dir)
        self.model = AutoModelForTokenClassification.from_pretrained(model_dir)

        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
        self.model.eval()

    def cleanse_text(self, text):

        text = text.replace("\n", " ")
        text = text.replace('\\"', '"')
        text = re.sub(r'\\u[0-9a-fA-F]{4}', '', text)
        text = re.sub(r'\\.', '', text)
        return text.strip()

    def preprocess_with_cv2(self, image):
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        return thresh

    def generate_ocr(self, image):
        if isinstance(image, fitz.Pixmap): 
            image = Image.frombytes("RGB", [image.width, image.height], image.samples)
        cv_image = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)
        preprocessed_image = self.preprocess_with_cv2(cv_image)
        pil_image = Image.fromarray(preprocessed_image)

        # Perform OCR
        ocr_text = pytesseract.image_to_string(pil_image).strip()
        ocr_text = self.cleanse_text(ocr_text)
        return ocr_text

    def predict_qa_labels_on_text(self, text: str):
        encoding = self.tokenizer(
            text,
            return_offsets_mapping=True,
            return_tensors="pt",
            truncation=False,
            padding=False
        )
        input_ids = encoding["input_ids"].to(self.device)
        attention_mask = encoding["attention_mask"].to(self.device)
        offsets = encoding["offset_mapping"] 

        with torch.no_grad():
            outputs = self.model(input_ids=input_ids, attention_mask=attention_mask)
        logits = outputs.logits  

        pred_ids = torch.argmax(logits, dim=-1).squeeze().cpu().numpy()

        results = []
        for i, label_id in enumerate(pred_ids):
            label_str = self.id_to_label_dict[label_id]
            start_char = offsets[0, i, 0].item()
            end_char   = offsets[0, i, 1].item()

            if start_char == 0 and end_char == 0 and i == 0:
                continue

            token_str = text[start_char:end_char]
            results.append({
                "token_str": token_str,
                "start_char": start_char,
                "end_char": end_char,
                "label": label_str
            })
        return results

    def group_labeled_spans(self, results):
        grouped = []
        current_label = None
        current_text = []
        start_char = None
        end_char = None

        for token in results:
            label = token["label"]
            token_str = token["token_str"]
            sc = token["start_char"]
            ec = token["end_char"]

            # Map B-QUESTION or I-QUESTION => "QUESTION"
            #     B-ANSWER or I-ANSWER     => "ANSWER"
            if label.startswith("B-QUESTION") or label.startswith("I-QUESTION"):
                label_category = "QUESTION"
            elif label.startswith("B-ANSWER") or label.startswith("I-ANSWER"):
                label_category = "ANSWER"
            else:
                label_category = "O"

            # If we hit an "O", we close any ongoing span
            if label_category == "O":
                if current_label is not None and current_label != "O":
                    grouped.append({
                        "text": " ".join(current_text),
                        "label": current_label,
                        "start_char": start_char,
                        "end_char": end_char
                    })
                current_label = "O"
                current_text = []
                start_char = None
                end_char = None
                continue

            if label_category != current_label:
                # We are switching label or starting a new span
                if current_label is not None and current_label != "O":
                    # close the old span
                    grouped.append({
                        "text": " ".join(current_text),
                        "label": current_label,
                        "start_char": start_char,
                        "end_char": end_char
                    })
                # start a new span
                current_label = label_category
                current_text = [token_str]
                start_char = sc
                end_char = ec
            else:
                # continuing the same label
                current_text.append(token_str)
                end_char = ec

        # if there's an unfinished span at the end
        if current_label is not None and current_label != "O" and current_text:
            grouped.append({
                "text": " ".join(current_text),
                "label": current_label,
                "start_char": start_char,
                "end_char": end_char
            })

        return grouped

    def populate_question_answer_dict(self, grouped_results, page_number):
        """
        Simple approach: The next ANSWER belongs to the last QUESTION.
        - Keep track of `last_question`.
        - If an ANSWER is encountered and we have a `last_question`, store it.
        - If no question is pending, store the answer with "question": None.
        """
        if page_number not in self.question_answer_dict:
            self.question_answer_dict[page_number] = []

        last_question = None
        for span in grouped_results:
            if span["label"] == "QUESTION":
                # Just store this as the last question
                last_question = span["text"]
            elif span["label"] == "ANSWER":
                if last_question:
                    self.question_answer_dict[page_number].append({
                        "question": last_question,
                        "answer": span["text"]
                    })
                    # optionally reset last_question = None 
                    # if we assume each question has only 1 answer
                    last_question = None
                else:
                    # no question => fallback
                    self.question_answer_dict[page_number].append({
                        "question": None,
                        "answer": span["text"]
                    })

    def data_extraction(self, pdf_file):
        pdf_document = fitz.open(stream=pdf_file, filetype="pdf")  # Open from memory
        for page_number in range(len(pdf_document)):
            page = pdf_document[page_number]
            image = page.get_pixmap()
            ocr_text = self.generate_ocr(image)
            print(f"======================= FINISHED OCR STAGE SUCCESSFULLY FOR PAGE {page_number} ==============================")
            token_results = self.predict_qa_labels_on_text(ocr_text)
            print(f"======================= FINISHED LABEL PREDICTION STAGE SUCCESSFULLY FOR PAGE {page_number} ==============================")
            grouped_results = self.group_labeled_spans(token_results)
            print(f"======================= FINISHED LABEL GROUPING STAGE SUCCESSFULLY FOR PAGE {page_number} ==============================")
            self.populate_question_answer_dict(grouped_results, page_number=page_number)
            print(f"======================= FINISHED QUESTION ANSWER STAGE SUCCESSFULLY FOR PAGE {page_number} ==============================")

        return self.question_answer_dict

if __name__ == "__main__":
    pdf_file = "/Users/vasumittal/NOSUHackathon/backend/app/services/synthetic_doc_1.pdf"
    extractor = DataExtraction()
    result = extractor.data_extraction(pdf_file)
    # print("=== Extracted Question-Answer Pairs ===")
    # for idx, pairs in result.items():
    #     for pair in pairs:
    #         print(f"Q: {pair['question']}")
    #         print(f"A: {pair['answer']}")
    #         print("-----")