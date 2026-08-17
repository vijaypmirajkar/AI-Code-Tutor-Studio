/* ==========================================================
   AI CODE TUTOR STUDIO
   app.js
========================================================== */


document.addEventListener("DOMContentLoaded", () => {

    console.log("app.js connected successfully");


    initSmoothScroll();

    initNavbar();

    initScrollTop();

    initThemeToggle();

    initMobileMenu();

    initReveal();

    initCounters();


});



/* ==========================================================
   SMOOTH SCROLL
========================================================== */


function initSmoothScroll(){


    document.querySelectorAll(
        'a[href^="#"]'
    )
    .forEach(link=>{


        link.addEventListener(
            "click",
            function(e){


                const target =
                document.querySelector(
                    this.getAttribute("href")
                );


                if(target){

                    e.preventDefault();


                    target.scrollIntoView({

                        behavior:"smooth",

                        block:"start"

                    });


                }


            });


    });


}





/* ==========================================================
   NAVBAR ACTIVE LINK
========================================================== */


function initNavbar(){


    const sections =
    document.querySelectorAll(
        "section[id]"
    );


    const links =
    document.querySelectorAll(
        ".nav-links a"
    );


    if(!sections.length) return;



    window.addEventListener(
        "scroll",
        ()=>{


            let current="";


            sections.forEach(section=>{


                const sectionTop =
                section.offsetTop - 150;



                if(window.scrollY >= sectionTop){

                    current =
                    section.id;

                }


            });



            links.forEach(link=>{


                link.classList.remove(
                    "active"
                );


                if(
                    link.getAttribute("href")
                    ===
                    "#"+current
                ){

                    link.classList.add(
                        "active"
                    );

                }


            });



        });



}







/* ==========================================================
   SCROLL TOP BUTTON
========================================================== */


function initScrollTop(){


    const button =
    document.createElement(
        "button"
    );


    button.className =
    "scroll-top";


    button.innerHTML =
    "↑";


    document.body.appendChild(button);



    window.addEventListener(
        "scroll",
        ()=>{


            if(window.scrollY > 500){

                button.classList.add(
                    "show"
                );


            }
            else{

                button.classList.remove(
                    "show"
                );

            }


        });



    button.onclick=()=>{


        window.scrollTo({

            top:0,

            behavior:"smooth"

        });


    };


}







/* ==========================================================
   DARK LIGHT THEME
========================================================== */


function initThemeToggle(){


    const button =
    document.createElement(
        "button"
    );


    button.className =
    "theme-toggle";


    button.innerHTML =
    "🌙";


    document.body.appendChild(
        button
    );



    button.onclick=()=>{


        document.body.classList.toggle(
            "light-mode"
        );


        const light =
        document.body.classList.contains(
            "light-mode"
        );



        button.innerHTML =
        light
        ?
        "☀️"
        :
        "🌙";



        localStorage.setItem(

            "theme",

            light
            ?
            "light"
            :
            "dark"

        );



    };



    const saved =
    localStorage.getItem(
        "theme"
    );



    if(saved==="light"){


        document.body.classList.add(
            "light-mode"
        );


        button.innerHTML="☀️";


    }



}







/* ==========================================================
   MOBILE MENU
========================================================== */


function initMobileMenu(){


    const navbar =
    document.querySelector(
        ".nav-links"
    );


    const button =
    document.querySelector(
        ".menu-toggle"
    );


    if(!button || !navbar)
        return;



    button.onclick=()=>{


        navbar.classList.toggle(
            "open"
        );


    };


}







/* ==========================================================
   SCROLL REVEAL
========================================================== */


function initReveal(){


    const elements =
    document.querySelectorAll(
        ".reveal"
    );



    if(!elements.length)
        return;



    const observer =
    new IntersectionObserver(
        entries=>{


            entries.forEach(entry=>{


                if(entry.isIntersecting){


                    entry.target.classList.add(
                        "active"
                    );


                }


            });


        },
        {

            threshold:.15

        });



    elements.forEach(el=>{

        observer.observe(el);

    });



}







/* ==========================================================
   NUMBER COUNTER
========================================================== */


function initCounters(){


    const counters =
    document.querySelectorAll(
        "[data-count]"
    );


    counters.forEach(counter=>{


        let target =
        Number(
            counter.dataset.count
        );


        let value=0;



        const update=()=>{


            value += Math.ceil(
                target/50
            );



            if(value>=target){

                value=target;

            }



            counter.innerText =
            value+"+";



            if(value<target){

                requestAnimationFrame(
                    update
                );

            }


        };


        update();



    });


}






console.log(
    "%cAI Code Tutor Studio Loaded",
    "color:#6366f1;font-size:18px;font-weight:bold;"
);
