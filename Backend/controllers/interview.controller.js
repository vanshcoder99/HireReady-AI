import fs from "fs" 
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs"
import { askAi } from "../services/openRouter.service.js"
import User from "../models/user.model.js"
export const analyzeResume = async (req,res) => {
    try {
        if(!req.file){
            return res.status(400).json({
                message: "Resume Required",
                statusCode: 400
            })
        }

        const filepath = req.file.path

        const FileBuffer = await fs.promises.readFile(filepath)
        const uint8Array = new Uint8Array(FileBuffer)

        const pdf = await pdfjsLib.getDocument({data: uint8Array}
        ).promise;

        let resumeText = "";
        // Extract text from all pages
        for(let pageNum = 1; pageNum <= pdf.numPages ; pageNum++){
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();  //this contains extracted byte to text object content.items is object array

            const pageText = content.items.map(item => item.str).join(" ");  //and text actual is in item.str of each array element of object
            resumeText += pageText + "\n";
        }

        resumeText = resumeText.replace(/\s+/g," ").trim();

        const messages = [
            {
                role: "system",   //what ai should do 
                content: `
                    Extract structured data from resume.

                    Return strictly JSON:

                    {
                        "role": "string",
                        "experience": "string",
                        "projects": ["project1","project2"],
                        "skills": ["skill1","skill2"],
                    }
                `
            },
            {
                role: "user",   // what the user will provide to user
                content: resumeText
            }
        ];

        const aiResponse = await askAi(messages)

        const parsed = JSON.parse(aiResponse);
        fs.unlinkSync(filepath)

        res.json({
            role: parsed.role,
            experience: parsed.experience,
            projects: parsed.projects,
            skills: parsed.skills,
            resumeText
        })

    } catch (error) {
        console.error(error);

        if(req.file && fs.existsSync(req.file.path)){
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            message: error.message,
            statusCode: 500
        })
    }
}


export const generateQuestions = async (req,res) => {
    try {
        const {role,experience,mode,resumeText,projects,skills} = req.body;

        role = role?.trim();
        experience = experience?.trim();
        mode = mode?.trim();

        if(!role || !experience || !mode){
            return res.status(400).json({
                message: "Role, Experience and Mode are required",
                statusCode: 400
            });
        }

        const user = await User.findById(req.userId)

        if(!user){
            return res.status(404).json({
                message: "User not found.",
                statusCode: 404
            });
        }

        if(user.credits < 50) {
            return res.status(400).json({
                message: "Not enough credits. Minimum 50 required."
            });
        }

        const projectText = Array.isArray(projects) && projects.length ? projects.join(", ") : "None";

        const skillsText = Array.isArray(skills) && skills.length ? skills.join(", ") : "None";
        
        const safeResume = resumeText?.trim() || "None";
        
        const userPrompt = `
            Role: ${role}
            Experience: ${experience}
            InterviewMode: ${mode}
            projects: ${projectText}
            skills: ${skillsText}
            Resume: ${safeResume}
        `;

        if(!userPrompt.trim()){
            return res.status(400).json({
                message: "Prompt content is empty."
            });
        }

        const messages = [
            {
                role: "system",
                content: 
                    `You are a real human interviewer conducting a professional interview.

                    Speak in simple, natural English as if you are directly talking to the candidate.

                    Generate exactly 5 interview questions.

                    Strict Rules:
                    - Each question must contain between 15 and 25 words.
                    - Each question must be a single complete sentence.
                    - Do Not number them.
                    - Do Not add explanations.
                    - Do Not add extra text before or after.
                    - One question per line only.
                    - Keep language simple and conversational.
                    - Questions must feel practical and realistic.

                    Difficulty progression:
                    Question 1 -> easy
                    Question 2 -> easy
                    Question 3 -> medium
                    Question 4 → medium  
                    Question 5 → hard  

                    Make questions based on the candidate’s role, experience,interviewMode, projects, skills, and resume details.
                `
            },
            {
                role: "user",
                content: userPrompt
            }
        ];

    } catch (error) {
        
    }
}