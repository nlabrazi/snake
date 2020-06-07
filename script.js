/***************************************
 *     Création et init du canvas      *
***************************************/

window.onload = function(){                                               //lance la fonction quand la fenetre s'affiche
    const canvasWidth     = 900;
    const canvasHeight    = 600;
    const blockSize       = 30;
    const canvas          = document.createElement('canvas');             //canvas --> element html5 qui permet de "dessiner"
    const ctx             = canvas.getContext('2d');                      //context permet de dessiner dans le canvas
    const widthInBlocks   = canvasWidth/blockSize;
    const heightInBlocks  = canvasHeight/blockSize;    
    const centreX         = canvasWidth / 2;
    const centreY         = canvasHeight / 2;    
    const sound           = {77:'audio'};
    let snakee;
    let applee;
    let score;
    let timeout;
    
    
    document.addEventListener('keydown', function(e) {
        const soundId = sound[e.which || e.keyCode];
    
        if (soundId) {
            const elem = document.getElementById(soundId);
    
            if ( elem.paused ) {
                elem.play();
            } else {
                elem.pause();
            }
        } else {
            console.log("key not mapped : code is", e.keyCode);
        }
    });

    init();

    function init(){

        canvas.width                 = canvasWidth;
        canvas.height                = canvasHeight;
        canvas.style.border          = "30px solid gray";                 //stylecss
        canvas.style.margin          = "50px auto";                       //stylecss
        canvas.style.display         = "block";                           //stylecss
        canvas.style.backgroundColor = "#ddd";                            //stylecss
        document.body.appendChild(canvas);                                //donne nous le document entier de notre page html
        launch();
    }


/***************************************
*       objet relancer le jeux         *
***************************************/

    function launch(){
        snakee  = new Snake([[6,4],[5,4],[4,4],[3,4],[2,4]], "right");    //each snake's blocks will be in an array with 2 valor x & y qui composera l'array of body of snake
        applee  = new Apple([10,10]);                                     //appelle de la pomme
        score   = 0;
        clearTimeout(timeout);
        delay   = 100;                                                    //vitesse initial
        refreshCanvas();
    }

  
/***************************************
* objet ajout de mouvement avec délais *
***************************************/

    function refreshCanvas(){
        snakee.advance();                                                 //déplacement du serpent
        if(snakee.checkCollision()){                                      //check si collision
            gameOver();
        } else {
            if(snakee.isEatingApple(applee)){                             //vérifier si snake a eat apple --> applee
                score++;
                snakee.ateApple = true;
                
                do {
                    applee.setNewPosition();                              //dire --> pomme replace toi si mangé
                } while(applee.isOnSnake(snakee));                        //replace toi si pomme pas sur le snakee

                if(score % 5 == 0){
                    speedUp();
                }
            }
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);               //permet de refresh le canvas        
            drawScore();                                                  //affiche le score
            snakee.draw();                                                //dessin du serpent
            applee.draw();                                                //dessine la pomme
            timeout = setTimeout(refreshCanvas, delay);
        }
    }


/***************************************
*           gestion vitesse            *
***************************************/    

function speedUp(){                                                       //augmente la vitesse par (100ms/2 donc refresh de 50ms etc...)
    delay /= 2;
}


/***************************************
*      objet affichage game over       *
***************************************/

    function gameOver(){
        ctx.save();
        ctx.font         = "bold 70px sans-serif"                         //stylecss
        ctx.fillStyle    = "#000";                                        //stylecss
        ctx.textAlign    = "center";                                      //stylecss
        ctx.textBaseline = "middle";                                      //stylecss
        ctx.strokeStyle  = "white";                                       //stylecss
        ctx.lineWidth    = 5;                                             //stylecss
        ctx.strokeText("Game Over Guignol", centreX, centreY - 180);
        ctx.fillText("Game Over Guignol", centreX, centreY - 180);
        ctx.font         = "bold 30px sans-serif";
        ctx.strokeText("Appuyer sur la touche ESPACE pour rejouer", centreX, centreY - 120);
        ctx.fillText("Appuyer sur la touche ESPACE pour rejouer", centreX, centreY - 120);
        ctx.restore();
    }


/***************************************
*          affichage du score          *
***************************************/    

    function drawScore(){
        ctx.save();
        ctx.font            = "bold 200px sans-serif"                     //stylecss
        ctx.fillStyle       = "gray";                                     //stylecss
        ctx.textAlign       = "center";                                   //stylecss
        ctx.textBaseline    = "middle";                                   //stylecss
        ctx.fillText(score.toString(), centreX, centreY);
        ctx.restore();   
    }


/***************************************
*objet création du prototype du serpent*
***************************************/

    function drawBlock(ctx, position){
        const x = position[0] * blockSize;
        const y = position[1] * blockSize;
        ctx.fillRect(x,y, blockSize, blockSize);                          //remplir le rectangle à la position x & y avec une size (lar/long) blockSize
    }

    function Snake(body, direction){
        this.body       = body;
        this.direction  = direction;
        this.ateApple   = false;
        
        this.draw = function(){                                           //methode qui permet de dessiner le serpent à l'écran dans le canvas
            ctx.save();                                                   //permet de sauvegarde le (ctx) contenu comme il l'était avant de rentrer dans cette fonction
            ctx.fillStyle = "#ff0000";
            for (let i=0 ; i < this.body.length ; i++){                   //tant que i< coprs du serpent alors i++ (permet de passer sur chacun des membre du body du serpent)
                drawBlock(ctx,this.body[i]);                              //permet de dessiner un block en lui donnant le contexte et la position du block à dessiner
            }
            ctx.restore();                                                //permet de remettre le ctx comme avant
        };

        this.advance = function(){                                        //fonction avancer le serpent
            let nextPosition = this.body[0].slice();                      //permet de créer un new element à partir d'un autre (une copie)
            switch(this.direction){                                       //analyse de la direction
                case"left":
                    nextPosition[0] -= 1;
                    break;
                case"right":
                    nextPosition[0] += 1;
                    break;
                case"down":
                    nextPosition[1] += 1;
                    break;
                case"up":
                    nextPosition[1] -= 1;
                    break;
                default:
                    throw("Invalid Direction");
            }
            this.body.unshift(nextPosition);                            //permet de rajouter le nextposition à notre première place
            if (!this.ateApple)                                         //si mange une pomme
                this.body.pop();                                        //supprimer le dernier élément
            else
                this.ateApple = false;                                  //donc ne fais pas cette fonction donc snake grandira d'un block
        };

        this.setDirection = function(newDirection){
            let allowedDirections;
            switch(this.direction){
                case"left":
                case"right":
                    allowedDirections = ["up", "down"];
                    break;
                case"down":
                case"up":
                    allowedDirections = ["left", "right"];
                    break;
                default:
                    throw("Invalid Direction");
            }
            if(allowedDirections.indexOf(newDirection) > -1){           //si la direction est permise
                this.direction = newDirection;
            }
        };

        this.checkCollision = function(){
            let wallColision                      = false;
            let snakeCollision                    = false;
            const head                            = this.body[0];         //tête du serpent
            const rest                            = this.body.slice(1);   //tous le reste du serpent
            const snakeX                          = head[0];
            const snakeY                          = head[1];
            const minX                            = 0;
            const minY                            = 0;
            const maxX                            = widthInBlocks - 1;
            const maxY                            = heightInBlocks - 1;
            const isNotBetweenHorizontaleWalls    = snakeX < minX || snakeX > maxX;
            const isNotBetweenVerticalWalls       = snakeY < minY || snakeY > maxY;            

            if (isNotBetweenHorizontaleWalls || isNotBetweenVerticalWalls){
                wallColision = true;                                      //check colision avec les murs
            }
            for(let i = 0; i < rest.length; i++){                         //tant que tête n'est pas en colision avec le body
                if(snakeX === rest[i][0] && snakeY === rest[i][1]){       //check si la tête et l'élément du corps on le même x et le même y
                    snakeCollision = true;
                }
            }

            return wallColision || snakeCollision;
        };

        this.isEatingApple = function(appleToEat){                        //if pomme a été mangé (same position x & y que ma tête)
            const head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]){
                return true;
            } else
            return false;
        }
    }


/***************************************
*      objet création de la pomme      *
***************************************/

    function Apple(position){
        this.position = position;

        this.draw = function(){
            const radius = blockSize/2;
            const x = this.position[0] * blockSize + radius;
            const y = this.position[1] * blockSize + radius;
            ctx.save();
            ctx.fillStyle = "#33cc33";
            ctx.beginPath();
            ctx.arc(x,y, radius, 0, Math.PI*2, true);                     //dessiner un rond
            ctx.fill();
            ctx.restore();
        };

        this.setNewPosition = function(){                                 //nouvelle poz de apple
            const newX = Math.round(Math.random()*(widthInBlocks - 1));   //donne un chiffre aléatoire entre 0 & 29
            const newY = Math.round(Math.random()*(heightInBlocks - 1));  //donne un chiffre aléatoire entre 0 & 29
            this.position = [newX, newY];
        };

        this.isOnSnake = function(snakeToCheck){
            let isOnSnake = false;
            for(let i = 0 ; i < snakeToCheck.body.length; i++){           //si ma apple pos est sur le snake --->
                if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]){
                    isOnSnake = true;
                }
            }
            return isOnSnake;
        };
    }


/***************************************
*        objet liens keyboard          *
***************************************/

    document.onkeydown = function handleKeyDown(e){                       //quand le user press button on keyboard
        const key = e.keyCode;
        let newDirection;
        switch(key){
            case 37:                                                      // flèche gauche
                newDirection = "left"
                break;
            case 38:                                                      // flèche haut
                newDirection = "up"
                break;
            case 39:                                                      // flèche droite
                newDirection = "right"
                break;
            case 40:                                                      // flèche bas
                newDirection = "down"
                break;
            case 32:
                launch();
                return;
            default:
                return;           
        }
        snakee.setDirection(newDirection);
    };
}