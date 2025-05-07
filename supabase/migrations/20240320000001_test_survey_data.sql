INSERT INTO public.surveys (
    title,
    description,
    created_by,
    questions
) VALUES (
    'Test Survey',
    'A survey to test different question types',
    '04155b79-9ae2-4c24-8df9-c85c61fe0ee0', -- Using existing user ID
    '[
        {
            "id": "q1",
            "question_type": "multiple_choice_single",
            "question_text": "What is your favorite programming language?",
            "required": true,
            "order_index": 1,
            "choices": [
                {
                    "id": "c1",
                    "text": "JavaScript",
                    "order_index": 1
                },
                {
                    "id": "c2",
                    "text": "Python",
                    "order_index": 2
                }
            ]
        },
        {
            "id": "q2",
            "question_type": "multiple_choice_multiple",
            "question_text": "Which frameworks do you use?",
            "required": true,
            "order_index": 2,
            "choices": [
                {
                    "id": "c1",
                    "text": "React",
                    "order_index": 1
                },
                {
                    "id": "c2",
                    "text": "Vue",
                    "order_index": 2
                }
            ]
        },
        {
            "id": "q3",
            "question_type": "short_answer",
            "question_text": "What improvements would you suggest?",
            "required": false,
            "order_index": 3
        }
    ]'::jsonb
);

-- Insert a test response
UPDATE public.surveys
SET responses = responses || '[
    {
        "user_id": "04155b79-9ae2-4c24-8df9-c85c61fe0ee0",
        "timestamp": "2024-03-20T10:00:00Z",
        "answers": [
            {
                "question_id": "q1",
                "answer": "c1"
            },
            {
                "question_id": "q2",
                "answer": ["c1", "c2"]
            },
            {
                "question_id": "q3",
                "answer": "Add more features to the dashboard"
            }
        ]
    }
]'::jsonb
WHERE title = 'Test Survey';