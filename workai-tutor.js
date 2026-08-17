/* ==========================================================
   AI CODE TUTOR STUDIO
   ai-tutor.js

   Frontend AI Communication Layer
========================================================== */


const API_URL = "http://localhost:8000";



let tutorContext = {

    code:"",

    language:"python",

    level:"Beginner",

    currentStep:0,

    history:[]

};







/* ==========================================================
   ANALYZE CODE
========================================================== */


async function analyzeCode(){


console.log(
"Starting AI Analysis..."
);



const code =
getEditorCode();



const language =
document.querySelector(
"#language"
)?.value || "Python";



const level =
document.querySelector(
"#level"
)?.value || "Beginner";





tutorContext.code = code;

tutorContext.language = language;

tutorContext.level = level;




try{


const response =
await fetch(

`${API_URL}/analyze`,

{

method:"POST",


headers:{


"Content-Type":
"application/json"


},


body:JSON.stringify({

code,

language,

level

})


}


);





const data =
await response.json();



displayExplanation(
data
);



}

catch(error){


console.error(
"AI Error:",
error
);



showAIMessage(

"Unable to connect with AI server."

);



}



}









/* ==========================================================
   DISPLAY AI RESPONSE
========================================================== */


function displayExplanation(data){



const box =
document.querySelector(
".explanation"
);



if(!box)
return;




box.innerHTML = `

<h3>
${data.title || "AI Explanation"}
</h3>


<p>

${data.explanation || 
"Analysis completed"}

</p>


`;





}









/* ==========================================================
   AI CHAT QUESTION
========================================================== */


async function askAI(question){



if(!question)
return;




try{


const response =
await fetch(

`${API_URL}/chat`,

{


method:"POST",


headers:{


"Content-Type":
"application/json"


},



body:JSON.stringify({

question,

context:tutorContext


})



}


);




const data =
await response.json();



return data.answer;



}



catch(error){


console.error(
error
);


return "AI server unavailable";


}



}









/* ==========================================================
   ERROR ANALYSIS
========================================================== */


async function checkErrors(){



const code =
getEditorCode();



const response =
await fetch(

`${API_URL}/errors`,

{


method:"POST",


headers:{


"Content-Type":
"application/json"


},


body:JSON.stringify({

code

})


}


);



return await response.json();



}









/* ==========================================================
   ALGORITHM INSIGHTS
========================================================== */


async function getAlgorithmInfo(){



const code =
getEditorCode();



const response =
await fetch(

`${API_URL}/algorithm`,

{


method:"POST",


headers:{


"Content-Type":
"application/json"


},


body:JSON.stringify({

code

})


}

);



return await response.json();



}









/* ==========================================================
   UI MESSAGE
========================================================== */


function showAIMessage(message){



const box =
document.querySelector(
".explanation"
);



if(box){


box.innerHTML=

`

<p>

${message}

</p>

`;


}


}








/* ==========================================================
   CONNECT BUTTON
========================================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


const button =
document.querySelector(
".analyze-btn"
);



if(button){


button.addEventListener(

"click",

analyzeCode

);


}



});