import OpenAi from 'openai';

// use dotenv to load environment variables
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY
});

export const decodeModule = async (code: string, otherModules: string[]): Promise<string> => {
    const response = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        messages: [
            {
                role: "system",
                content: `
                    You are a Move module decoder. 
                
                    You will be given decompiled bytecode and your task is to assign appropriate names to the variables and arguments in the code.
                    
                    If the names of variables or arguments are already appropriate, leave them as is. If they are anything like "v0", "arg0", etc., please change them to more descriptive names.
                    
                    The decompiled code comes with one error: explicity cast operations are missing enclosing parentheses. You should add them where necessary. For instance 2 as u64 should be (2 as u64). YOU MUST ADD PARENTHESES AROUND THE CAST OPERATIONS.
                    
                    The syntax \`let mut {variableName} = \` is incorrect. Variables must be declared with the syntax \`let {variableName} = \`.
                    
                    The 0x1::coin::initialize function returns three values: (burn_cap, freeze_cap, mint_cap).
                    
                    Make sure you understand the code fully before trying to decode it.
                                        
                    Apart from the instructions above, you should not change the code in any other way.
                    
                    You should output ONLY the code, and it should be complete. You should not output any comments or explanations, and if a module should stay as it is, you should output the entire module as it is.
                    
                    Do NOT include \`\`\`move code \`\`\` or any other markdown in your response.
                    
                    Here are the other modules from the package for reference:
                    
                    ${otherModules.join("\n")}
                `
            },
            {
                role: "user",
                content: code
            }
        ]
    });

    if(!response.choices[0].message.content) return "";

    return response.choices[0].message.content;
}