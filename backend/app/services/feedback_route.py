
import os
from openai import OpenAI

client = OpenAI(
    base_url="https://models.inference.ai.azure.com",
    api_key=os.environ["GITHUB_TOKEN"],
)
question_1 = "What is the capital of France?"
student_ans_1 = "Berlin"
correct_ans_1 = "Paris"

question_2 = "What is the chemical symbol for water?"
student_ans_2 = "CO2"
correct_ans_2 = "H2O"

question_3 = "What is the largest planet in our solar system?"
student_ans_3 = "Earth"
correct_ans_3 = "Jupiter"

question_4 = "What is the value of π?"
student_ans_4 = "3.15"
correct_ans_4 = "3.14"

response = client.chat.completions.create(
    messages=[
        {
            "role": "system",
            "content": "",
        },
        {
            "role": "user",
            "content": 
            f"These are the list of questions I got wrong on a test, along with my wrong answers and the correct answers.\
            I need you to identify the topic(s) where I went wrong and provide specific feedback. Here is the data:\n\
                \
            1. Question:{question_1}\n\
            Student's Answer: {student_ans_1}\n\
            Correct Answer: {correct_ans_1}\n\
                \
            2. Question: {question_2}\n\
            Student's Answer: {student_ans_2}\n\
            Correct Answer: {correct_ans_2}\n\
                \
            3. Question: {question_3}\n\
            Student's Answer: {student_ans_3}\n\
            Correct Answer: {correct_ans_3}\n\
                \
            4. Question: {question_4}\n\
            Student's Answer: {student_ans_4}\n\
            Correct Answer: {correct_ans_4}\n\
                \
            Please analyze the data and provide feedback on the topics where I need improvement.",
        }
    ],
    model="gpt-4o",
    temperature=1,
    max_tokens=4096,
    top_p=1
)

print(response.choices[0].message.content)
