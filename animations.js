/* =====================================================
 AI CODE TUTOR STUDIO
 animations.js
===================================================== */


window.addEventListener("load",()=>{


    console.log("Animation file loaded");


    if(typeof gsap === "undefined"){

        console.log(
            "GSAP missing"
        );

        return;

    }


    gsap.registerPlugin(
        ScrollTrigger
    );


    startHeroAnimation();

    startScrollAnimation();

    startFloatingAnimation();



});



/* ===============================
 HERO
================================ */


function startHeroAnimation(){


    gsap.from(
        ".hero-content",
        {

            opacity:0,

            y:60,

            duration:1,

            ease:"power3.out"


        }
    );



    gsap.from(
        ".editor-window",
        {

            opacity:0,

            x:80,

            duration:1,

            delay:.3,

            ease:"power3.out"


        }
    );


}







/* ===============================
 SCROLL
================================ */


function startScrollAnimation(){


    const items =
    document.querySelectorAll(
        ".feature-card"
    );


    items.forEach(item=>{


        gsap.from(
            item,
            {

                scrollTrigger:{


                    trigger:item,

                    start:"top 85%"


                },


                opacity:0,

                y:50,

                duration:.8



            }
        );


    });


}








/* ===============================
 FLOATING
================================ */


function startFloatingAnimation(){


    const editor =
    document.querySelector(
        ".editor-window"
    );



    if(editor){


        gsap.to(
            editor,
            {

                y:-15,

                duration:2.5,

                repeat:-1,

                yoyo:true,

                ease:"sine.inOut"


            }
        );


    }



}
