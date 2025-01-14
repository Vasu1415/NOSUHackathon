
import os, ast
from openai import OpenAI
from azure.ai.inference import ChatCompletionsClient
from azure.ai.inference.models import SystemMessage
from azure.ai.inference.models import UserMessage
from azure.core.credentials import AzureKeyCredential
from sentence_transformers import SentenceTransformer, util
from concurrent.futures import ThreadPoolExecutor, as_completed
from inference import DataExtraction

class FeedbackService:
    def __init__(self):
        pass
    
    # Input: A list of questions
    def response_4o(self, prompt, questions, max_tokens=200):
        client = OpenAI(
            base_url="https://models.inference.ai.azure.com",
            api_key=os.environ["GITHUB_TOKEN"],
        )
        request = prompt
        for question in questions:
            request += f"Q: {question}\nA: "
        try:
            print("making call to GPT 4o")
            response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": ""},
                    {"role": "user", "content": request}
                ],
                model="gpt-4o",
                temperature=1,
                max_tokens=max_tokens,
                top_p=1
            )
            content = response.choices[0].message.content
            answers = ast.literal_eval(content) if isinstance(ast.literal_eval(content), list) else [content]
        except Exception as e:
            print(f"Error with GPT 4o: {e}")
            answers = [""] * len(questions)
            
        print("received response from GPT 4o")
        content = response.choices[0].message.content
        try:
            answers = ast.literal_eval(content)
            if not isinstance(answers, list):
                answers = [content]
        except:
            answers = [content]
        
        return answers

    def response_llama(self, prompt, questions, max_tokens=200):
        # azure-ai-inference in requirements.txt
        
        client = ChatCompletionsClient(
            endpoint="https://models.inference.ai.azure.com",
            credential=AzureKeyCredential(os.environ["GITHUB_TOKEN"]),
        )
        request = prompt
        for question in questions:
            request += f"Q: {question}\nA: "
        try:
            print("making call to Llama")
            response = client.complete(
                messages=[
                    SystemMessage(content=""""""),
                    UserMessage(content=request),
                ],
                model="Llama-3.3-70B-Instruct",
                temperature=0.8,
                max_tokens=200,
                top_p=0.1
            )
        except Exception as e:
            print(f"Error with GPT Llama: {e}")
            answers = [""] * len(questions)
                
        print("received response from Llama")
        content = response.choices[0].message.content
        try:
            answers = ast.literal_eval(content)
            if not isinstance(answers, list):
                answers = [content]
        except:
            answers = [content]
        return answers


    def response_mistral(self, prompt, questions, max_tokens=200):
        client = ChatCompletionsClient(
            endpoint="https://models.inference.ai.azure.com",
            credential=AzureKeyCredential(os.environ["GITHUB_TOKEN"]),
        )

        request = prompt
        for question in questions:
            request += f"Q: {question}\nA: "
        print("making call to Mistral")    
        response = client.complete(
            messages=[
                SystemMessage(content=""""""),
                UserMessage(content=request),
            ],
            model="Mistral-Large-2411",
            temperature=0.8,
            max_tokens=200,
            top_p=0.1
        )
        print("received response from Mistral")
        content = response.choices[0].message.content
        try:
            answers = ast.literal_eval(content)
            if not isinstance(answers, list):
                answers = [content]
        except:
            answers = [content]
        return answers

    def similarity_score(self,answer_1, answer_2):
        print("calculating similarity score")
        model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
        embeddings = model.encode([answer_1, answer_2])
        similarity_score = util.cos_sim(embeddings[0], embeddings[1])
        return similarity_score.item()

    def combine_responses(self,responses):
        combined_text = "\n".join(responses)
        client = OpenAI(api_key=os.environ["GITHUB_TOKEN"])
        response = client.chat.completions.create(
            messages=[
                {"role": "system", 
                "content": "Combine the following responses into a coherent and meaningful answer:"
                },
                {"role": "user", 
                "content": combined_text
                }
            ],
            model="gpt-4o-mini",
            temperature=1,
            max_tokens=200,
            top_p=1
        )
        return response.choices[0].message.content

    def multimodel_responses(self, questions):
        threshold_sim = 0.75
        
        # answers_4o = response_4o(questions)
        # answers_llama = response_llama(questions)
        # answers_mistral = response_mistral(questions)
        prompt = "Answer the following questions and return the output as an\
        array of answers for their respective questions at their respective indices. Write each answer in around 150 words:\n"
        tasks = {
            'gpt-4o': lambda: self.response_4o(prompt, questions),
            'llama': lambda: self.response_llama(prompt, questions),
            'mistral': lambda: self.response_mistral(prompt, questions)
        }

        results = {}

        with ThreadPoolExecutor(max_workers=3) as executor:
            future_to_model = {executor.submit(task): model for model, task in tasks.items()}
            for future in as_completed(future_to_model):
                model_name = future_to_model[future]
                try:
                    results[model_name] = future.result()
                except Exception as e:
                    print(f"{model_name} failed with error: {e}")
                    results[model_name] = [""] * len(questions)

        answers_4o = results['gpt-4o']
        answers_llama = results['llama']
        answers_mistral = results['mistral']
        
        final_answers = []

        for i in range(len(questions)):
            answer_4o = answers_4o[i]
            answer_llama = answers_llama[i]
            answer_mistral = answers_mistral[i]

            sim_4o_llama = self.similarity_score(answer_4o, answer_llama)
            sim_4o_mistral = self.similarity_score(answer_4o, answer_mistral)
            sim_llama_mistral = self.similarity_score(answer_llama, answer_mistral)
            print("sim_4o_llama", sim_4o_llama)
            print("sim_4o_mistral", sim_4o_mistral)
            print("sim_llama_mistral", sim_llama_mistral)
            if sim_4o_llama >= threshold_sim and sim_4o_llama > sim_4o_mistral and sim_4o_llama > sim_llama_mistral:
                final_answers.append(answer_4o)
            elif sim_4o_mistral >= threshold_sim and sim_4o_mistral > sim_4o_llama and sim_4o_mistral > sim_llama_mistral:
                final_answers.append(answer_4o)
            elif sim_llama_mistral >= threshold_sim and sim_llama_mistral > sim_4o_llama and sim_llama_mistral > sim_4o_mistral:
                final_answers.append(answer_llama)
            else:
                combined = self.combine_responses([answer_4o, answer_llama, answer_mistral])
                final_answers.append(combined)
        return final_answers

    def generate_feedback(self, wrong_questions, wrong_student_answers, correct_questions, correct_student_answers, model_answers, model_choice):    
        prompt = f"You are a helpful tutor. Provide constructive feedback on the student's answer. The student has answered the following questions incorrectly:"
        for i in range(len(wrong_questions)):
            prompt += f"\n\nQuestion: {wrong_questions[i]}\n\nYour Answer: {wrong_student_answers[i]}\n\nCorrect Answer: {model_answers[i]}"
        prompt += "\n\nThe student has answered the following questions correctly:"
        for i in range(len(correct_questions)):
            prompt += f"\n\nQuestion: {correct_questions[i]}\n\nYour Answer: {correct_student_answers[i]}\n\nCorrect Answer: {model_answers[i]}"
            
        prompt += "Feedback:\
            1. What did the student answer correctly?\
            2. What concepts did the student misunderstand or miss?\
            3. How can the student improve their answer?\
            Speak directly to the student. Mention their strengths and areas for growth. Mention specific topics and questions from the exam as examples and suggestions for improvement.\
                Write in under 350 words"
            
        if model_choice == 'gpt-4o':
            feedback = self.response_4o("", [prompt], max_tokens=500)[0]
        elif model_choice == 'llama':
            feedback = self.response_llama("", [prompt], max_tokens=500)[0]
        elif model_choice == 'mistral':
            feedback = self.response_mistral("", [prompt], max_tokens=500)[0]
        return feedback

    def extract_questions_answers(self, question_answer_dict):
        questions = []
        answers = []
        
        for page_data in question_answer_dict.values():
            for qa_pair in page_data:
                questions.append(qa_pair["question"])
                answers.append(qa_pair["answer"])
        
        return questions, answers

    def get_topics(self, questions):
        topics = []
        for question in questions:
            topics.append(self.response_4o("Give a list of topics that the question is related to", [question]))
        return topics
    
    def feedback_route(self, pdf_path, model_choice):
        inference = DataExtraction()
        question_answer_dict = inference.data_extraction(pdf_path)
        print("received question_answer_dict")
        questions, student_answers = self.extract_questions_answers(question_answer_dict)
        print("extracted questions and student answers")
        
        q_prompt = "Fix the grammar of the following questions and return the corrected questions in an array in the same order"
        a_prompt = "Fix the grammar of the following answers and return the corrected answers in an array in the same order"
        
        fixed_questions = self.response_4o(q_prompt, questions)
        fixed_answers = self.response_4o(a_prompt, student_answers)
        questions = fixed_questions
        student_answers = fixed_answers
        model_answers = self.multimodel_responses(questions)
        print("received final answers from model(s)")

        wrong_questions = []
        wrong_student_answers = []
        similarity_scores = []
        
        correct_questions = []
        correct_student_answers = []
        for i in range(len(questions)):
            sim_score = self.similarity_score(student_answers[i], model_answers[i])
            similarity_scores.append(sim_score)
            if sim_score < 0.8:
                wrong_student_answers.append(student_answers[i])
                wrong_questions.append(questions[i])
            elif sim_score >= 0.8:
                correct_questions.append(questions[i])
                correct_student_answers.append(student_answers[i])
        
        feedback = self.generate_feedback(wrong_questions, wrong_student_answers, correct_questions, correct_student_answers, model_answers, model_choice)        
        return feedback

if __name__ == '__main__':
    model_choice = 'gpt-4o' # get from frontend
    pdf_path = "/mnt/c/Users/kamal/Downloads/sample_doc.pdf"
    feedback_service = FeedbackService()
    print(feedback_service.feedback_route(pdf_path, model_choice))
