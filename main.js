(function(){

    function el(css){
        return document.querySelector(css)
    }

    function create(html){
        return document.createElement(html)
    }


    // Variable definiert
    let ship;
    let angle;
    let kugelns;
    let feinds;
    let maxfeind;
    let score;
    let kills;
    let spiel=false;

    // html elementen angeruft
    let canvas = el('#canvas')
    let scoreDiv = el('#score')
    let killDiv = el('#kills')
    let main = el('#main')
    let btnDiv = el('#btn-div')
    let start = el('#start')
    let text = el('#text')

    // Canvas definiert
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width=width;
    canvas.height=height;
    let ctx = canvas.getContext('2d')
    ctx.clearRect(0,0,width,height)


    // sounds definiert
    let laser = new Audio("./mp3/laser.mp3") 
    let bomb = new Audio("./mp3/bomb.mp3") 
    let winner = new Audio("./mp3/winner.mp3")


    // spaceship class erstellt
    class Ship{
        constructor(x,y,r,c){
            this.x=x
            this.y=y
            this.r=r
            this.c=c

        }
        // Spaceship zeichnen
        draw(){
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle * Math.PI / 180)
            ctx.fillStyle=this.c
            ctx.beginPath();
            ctx.arc(0,0,this.r,0,Math.PI * 2)
            ctx.moveTo(0, 30);
            ctx.lineTo(75, 0);
            ctx.lineTo(0, -30);
            ctx.lineTo(25, 0);
            ctx.fill();
            ctx.closePath();
            ctx.restore();   
        }
    }

    
    // circle class erstellt
    class Circle{
        constructor(bx,by,tx,ty,r,c,s){
            this.bx=bx
            this.by=by
            this.tx=tx
            this.ty=ty
            this.x=bx
            this.y =by
            this.r=r
            this.c=c
            this.s=s
        }

        // Circle zeichnen
        draw(){
            ctx.fillStyle=this.c;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        }

        // target x und target y aktulaisieren mit hipotenüs
        update(){
            let dx = this.tx - this.bx
            let dy = this.ty - this.by
            let hip = Math.sqrt(dx * dx + dy * dy)
            this.x += (dx / hip) * this.s
            this.y += (dy / hip) * this.s
        }

        // wenn Circle nicht in window denn Circle weg
        remove(){
            if((this.x<0 || this.x>width) || (this.y<0 || this.y>height)){
                return true;
            }else{
                return false;
            }           
        }
    }

    // Feind function hinzufügt Circle Feind
    function addFeind(){
        // wenn Fein Circle weg ist kommt neue circle
        for(let i=feinds.length; i<maxfeind; i++){
            let r = Math.random() * 30 + 10;
            let c = colors()
            let s= 0.5 + ((40- ((r/200) * r)) / 200) /  maxfeind;

            //Feind Circle kommt link, recht, oben oder unten
            let x,y;
            if(Math.random() < 0.5){
                x = (Math.random() > 0.5) ? width : 0;
                y = Math.random() * height;
            }else{
                x = Math.random() * width;
                y = (Math.random() < 0.5) ? height : 0;
            }
            feinds.push(new Circle(x,y,ship.x, ship.y,r,c,s))
        }
    }


    // kollision function kontroliert kollision von elementen
    function kollision(x1,y1,r1,x2,y2,r2){
            let dx = x1 - x2
            let dy = y1 - y2
            let hip = Math.sqrt(dx * dx + dy * dy)

            if(hip < (r1 + r2)){
                return true;
            }else{
                return false;
            }
    };

    // mouse function, wenn mouse bewegt, bewegt Spaceship auch 360 Grad
  function mouseMove(e){
        if(spiel){
            let dx = e.pageX - ship.x
            let dy = e.pageY - ship.y
            let tetha = Math.atan2(dy,dx)
            tetha *= 180/Math.PI
            angle = tetha
        }
  }

  // Kugeln function erstellet, produziert Kugeln
  function clickBullets(e){
        kugelns.push(new Circle(ship.x, ship.y, e.pageX, e.pageY, 5, 'red', 10))
        laser.play() 
    
  }


  // Animation function erstellt
  // wenn init function fonksioniert animate function auch fonksioniert
    function animate(){
        if(spiel){
            requestAnimationFrame(animate)
            //ctx.clearRect(0,0,width,height)
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(0,0,width,height);
            ctx.fill();

            // Circle aufreruft
            feinds.forEach((feind,index)=>{
                
                // wenn Kugeln bewegt Circle kommt neue kugeln
                kugelns.forEach((kugeln,b) =>{
                    if(kollision(feind.x, feind.y, feind.r, kugeln.x, kugeln.y, kugeln.r)){

                        // wir sammeln punkte
                        // wenn Feind Circle groste als 15 prozent ist, muss mann mit vielen Kugeln berühen
                        // wenn grose Circle berühen bekommen wir 25 punkte
                        // pro 10 Feind ertöteten kommt neue Feind mehr
                      if(feind.r < 15){
                        feinds.splice(index,1)
                        score += 25;
                        kills ++;
                        if(kills % 10 === 0){
                            maxfeind++
            
                        }
                        addFeind()
                        // pro kugeln 5 prozent ist weg und 5 punkte bekommen
                      }else{
                          feind.r -= 5;
                          score += 5
                      }                      
                        kugelns.splice(b,1)                     
                    }
                })

                // wenn ein Feind Circle Spaceship berüht, ist Spiel ende 
                // und kommt button. mann kann nochmal spielen
                if(kollision(feind.x, feind.y, feind.r, ship.x, ship.y, ship.r)){               
                    btnDiv.classList.remove('hidden');
                    start.innerHTML = 'TRY AGAIN'
                    text.innerHTML = 'YOU LOST <br> 👎🏼 👎🏼 👎🏼 <br> SCORE : ' + score + '<br> KILLS : ' + kills;
                    spiel=false;
                    bomb.play()
                    
                }

                // wenn Kugeln  Circle berüht Circle ist weg und kommt neue Circle
                if(feind.remove()){
                    feinds.splice(index,1)
                    addFeind()
                }
                feind.update();
                feind.draw();

        });
        // wenn Kugeln  Circle berüht kugeln ist weg und kommt neue Kugeln
        kugelns.forEach((kugeln,b) => {
            if(kugeln.remove()){
                kugelns.splice(b,1)
            }
            kugeln.update()
            kugeln.draw()
            
        });
        // Scorebord tabella
        ship.draw()
        scoreDiv.innerHTML = 'SCORE : '+score;
        killDiv.innerHTML = 'KILLS : '+kills;
        
      
    }
    winn()
    
};

// 500 Stern erstellt
// wenn sterne kleine als 3 prozent mann sieht das lightgray oder gray
// mit random auf dem ganzen fenster geteilt
function makeStar(){

    for(let i=1; i<500; i++){
        const stern = create("div")
        let x = Math.floor(Math.random() * width)
        let y = Math.floor(Math.random() * height)
        stern.style.top = y +"px";
        stern.style.left = x +"px";
        stern.classList.add("stern")
        let sternsize = Math.floor(Math.random() * 3)
        stern.style.height = sternsize +"px";
        stern.style.width = sternsize +"px";
        stern.style.background = sternsize < 3 ? "lightgray" : "gray";
        main.appendChild(stern)
        } 
    };
    

    // gemischt farben function
    // wir bekommen verschieden farben
    function colors(){
        let r = Math.floor(Math.random() * 250)+56;
        let g = Math.floor(Math.random() * 256);
        let b = Math.floor(Math.random() * 256);
        
        return `rgb(${r},${g},${b})`;
    };

    // winn function, wenn player gewonnen fonksioniert
    // spiel ende kommt button
    function winn(){
        if(score>10000 || kills==200){                   
            start.innerHTML = 'NEW GAME'
            btnDiv.classList.remove('hidden');
            text.innerHTML = 'YOU WON <br>  🏆 🏆 🏆 <br> SCORE : ' + score + '<br> KILLS : ' + kills;
            spiel=false;
            winner.play()   
        };
    
    };

     // wenn wir start button clicken init function fonksioniert 
     // und Spiel fangt
    function init(){
        score=0;
        kills=0;
        spiel =true;
        angle =0;
        kugelns=[];
        feinds=[];
        maxfeind =2;
        btnDiv.classList.add('hidden')
        ship = new Ship(width/2, height/2, 20, 'white')
        addFeind()
        animate()
        makeStar() 
               
    }; 

    // 3 button mit function aufgeruft
    canvas.addEventListener('mousemove',mouseMove)
    canvas.addEventListener('click', clickBullets)
    start.addEventListener('click', init)
    
}())