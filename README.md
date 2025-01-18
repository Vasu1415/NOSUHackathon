# StudyBuddy.io

## Inspiration
As university students, we often felt the lack of meaningful feedback in our learning journey. This inspired us to create an AI-powered platform that empowers students with free, instant access to detailed insights and progress tracking. Our goal is to help learners grow, improve, and become better every day.

---

## What It Does
- **Exam Analysis:** Upload graded exam PDFs and leverage LLM models like ChatGPT, LLAMA, and more to generate detailed feedback on strengths, weak topics, and actionable next steps.
- **Dynamic Mini Tests:** Generate dynamic, time-based mini tests for quick practice on topics of your choice using LLM technologies.
- **Progress Tracking:** Efficiently track progress and improvement based on your performance in graded exams.

---

## How We Built It 

### 1. **Data Extraction Pipeline**
We designed a token classification model to predict questions and answers from documents:
- **Synthetic Dataset Generation:** Leveraged Cohere's text generation model to create a dataset of questions and answers.
- **Manual Annotations:** Annotated a dataset of 600+ images on CVAT to extract bounding box coordinates for questions.
- **Bounding Box Coordinates:** Used these coordinates to extract corresponding answer regions in the document.
- **OCR Integration:** Performed OCR on documents and stored results in JSON format.
- **Model Training:** Trained a token classification model using `BertTokenizer`, achieving high recall, precision, and F1 scores (83-86%).

The data extraction pipeline ensures accurate and reliable question-answer identification from documents.

### 2. **Feedback Pipeline**
Using the data extraction results, we developed a feedback pipeline to evaluate and enhance learning:
- **Answer Evaluation:** 
  - Passed extracted questions into three different LLMs (LLAMA, GPT-4o, and MISTRAL) to generate reference answers.
  - Compared user responses with LLM-generated answers to assess correctness.
- **Tailored Feedback:** Provided detailed feedback based on the similarity between user responses and reference answers.
- **Performance Tracking:** Stored user progress, performance metrics, and feedback for future reference, enabling a continuous learning experience.

### 3. **Custom Mini Test Generation**
The platform supports the creation of personalized practice materials:
- Users can specify topics they need more practice on.
- The system generates MCQ-based mini-tests tailored to the user’s preferences and learning needs.

## What's Next for StudyBuddy.io
- Successfully integrate the feedback and data extraction pipelines.
- Ensure complete and robust functionality.
- Expand the platform by integrating additional models and features.


