/* ==========================================================
   AI CODE TUTOR STUDIO
   Monaco Editor Setup
========================================================== */


let editor;



window.addEventListener(
"load",
()=>{


initializeMonaco();


});






function initializeMonaco(){



require.config({

paths:{

vs:
"https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.0/min/vs"

}

});






require(
[
"vs/editor/editor.main"

],
function(){



editor =
monaco.editor.create(

document.getElementById(
"monaco-editor"
),

{


value:

`def hello():

    name = "AI"

    print(name)


hello()
`,



language:"python",



theme:"vs-dark",



automaticLayout:true,



fontSize:16,



minimap:{


enabled:true


},



scrollBeyondLastLine:false



}





);





console.log(
"Monaco Editor Loaded"
);



});



}








/* ==========================================================
   CHANGE LANGUAGE
========================================================== */


function changeEditorLanguage(language){


if(!editor)
return;



monaco.editor.setModelLanguage(

editor.getModel(),

language


);


}








/* ==========================================================
   GET CODE
========================================================== */


function getEditorCode(){


if(editor)

return editor.getValue();



return "";



}







/* ==========================================================
   SET CODE
========================================================== */


function setEditorCode(code){



if(editor){


editor.setValue(
code
);



}



}