//Developed by Wandevelop
//GLOBAL VARIABLES
//Colors
//backgound
// var backgroundColor = "#2255a788"
var backgroundColor = "skyblue"

var rocksColor = "#7f4e44"

//fireEffectUp
var gasEffect1 = "#fffc33"

//fireEffectDown
var gasEffect2 = "#00ffff"

var player, playerHitBox;

var playerCollisionRadius = 20;//PLAYER HITBOX SIZE

var itemsHitbox;

var gravity = 1;

var currentLocation = "earth"

var starsGenerate = false

var rocks, rocksHitbox, rocksParticles;

var starsList; //STARS ON SCREEN

var debug = false; //DEBUG MODE

var gameOverTrigger = false; //FINISH THE GAME

var screen; //UI OBJECT 

var FPS = 60

var gameDifficult_LIMIT = 5 //GAME SPEED LIMIT

var gameDifficult = 1 //GAME DIFICULT INCREASE ROCKS SPEED


function Screen() {
    /*
    SECREEN OBJECT SHOWS SCORE, HP BAR AND GAME OVER
    SCREEN
    
    ALSO STORE THE CURRENT SCORE
    */
    this.gameover = false
    
    this.score = 0
    
    this.lifeBarSize = width //INITIAL HP BAR SIZE 
    
    
    this.draw = ()=> {
        
        if(this.gameover) {
            fill(255)
            noStroke()
            textFont("Consola")
            textSize(30)
            text("Game Over !",(width/2)-80,height/2)
        }
        if(!this.gameover) {
            //score manager
            if(frameCount % 30 == 0) {
                this.score += 1
            }
            
        }
        noStroke()
        //Score Display
        fill(255)
        textSize(23)
        text(floor(this.score),width-60,30)
        
        //hp bar display
        fill("#0f0")
        noStroke()
        rect(0,height-20,this.lifeBarSize,20)
        
        
        
    }
    this.update = () => {
        
        if(gameOverTrigger) {
            this.gameover = true
        }
        
        this.lifeBarSize = floor(width) / 100 * player.hp
        
    }
    
}

function Rock(){
        /*
        OBSTACLES FROM THE GAME
        
        THOSE ROCKS SPAWN RANDOMLY BETWEEN 0 AND
        SCREEN HEIGHT, GOES LEFT AND GET DELETED
        WHEN X POSITION IS LESS THEN WIDTH.
        
        IF THIS ROCKS COLLIDES WITH PLAYER, THE
        PLAYER GET DAMAGE
        
        */
        
        this.x = width
        this.y = random(height) 
        
        this.radius = random(10,30)
        
        this.minSpeed = 2
        this.maxSpeed = 4 * gameDifficult
        
        this.draw = ()=> {
            //draw trees 
            if(currentLocation == "earth")
            {
                fill(rocksColor)
                rect(this.x-5,this.y,10,1000)
            
                fill("green")//rocksColor)
                
                noStroke()
            ellipse(this.x,this.y,this.radius*2,this.radius*2)
            
            
            }
            //draw rocks
            else if(currentLocation = "space") {
            
                fill(rocksColor)
                
                noStroke()
               ellipse(this.x,this.y,this.radius*2,this.radius*2)
                
                
            }

        }
        this.update = ()=> {
            this.x -= random(this.minSpeed,this.maxSpeed)
            
            this.y += 0.3
            
        }
        
        //MOVE THE ROCK TO OUT OF THE SCREEN
        this.destroy = () =>{
            
            this.x = -10
            
        }
        
}

function Star() {
    /*
    STARS OBJECT
    
    Always will have 54 stars on screen, it makes the
    game smooth.
    
    
    */
    
    this.x = width + 10
    this.y = random(height)
    this.speed = 2 * gameDifficult
    
    
    this.draw = () =>{
        fill(255)
        ellipse(this.x,this.y,2,2)
    }
    this.update = ()=>{
        this.x -= this.speed
    }
    
}
function Particles(x,y,color) {
    /*Particles Object
    
    Used to break rocks that has collide with player
    
    */
    this.x = x
    this.y = y
    this.size = 1
    
    this.intensity = 5
    
    this.maxvx = 3
    this.minvx = 8
    
    this.color = color
    
    this.draw = () =>{
        for(let i=0;i<this.intensity;i++) {
            strokeWeight(this.size)
            stroke(this.color)
            
            point(
            random(this.x,this.x*-3),
            random(this.y+30,this.y-30),
            );

        }
    }
    this.update =() => {
        
        this.x += random(-1,1)
        this.y += random(-1,1)
        
        this.x -= random(this.minvx,this.maxvx)
        this.y += gravity
        
    }
    
}

function Item(x,y) {
    //ITEMS GIVES SPECIAL EFFECTS TO PLAYER
    this.x = width
    this.y = random(height) 
        
    this.radius = 40
        
    this.minSpeed = 2
    this.maxSpeed = 4 * gameDifficult
    
    
    this.draw = () => {
        
        
        //shield render
        stroke("#005544")
        
        
        fill("cyan")
        
        ellipse(this.x,this.y,this.radius)
        
    }
    
    this.update = () => {
        
        this.x -= 2
        
    }
      
}

function HitBox(x,y,r,color,reference) {
    /*
    HITBOXES INVISIBLE BUT IMPORTANT
    
    You cannot see these hitboxes but they are there,
    if you want to see then turn debug mode on.
    
    */
    this.x = x
    this.y = y
    
    this.r = r //radius
    
    this.color = color
    
    //this.id = id
    this.reference = reference //------
    /*Reference -> Is an object(player/rock)
    that gives its hitbox position, then this HitBox
    checks if its colliding with itself.
    */
    
    this.draw = () =>{
        noFill()
        stroke(color)
        ellipse(this.x,this.y,this.r*2,this.r*2)
        
    }
    
    this.update = () => {
        //follows object position
        
        this.x = reference.x
        this.y = reference.y
        
    }
    //Check colission between "this" and other object.
    this.checkCollisionWith = (other) =>{
        let dis = dist(this.x,this.y,other.x,other.y)
        
        if(dis < this.r + other.r) return true
        else return false
        
    }
}

function setup() {
    //SETUP THE GAME
    
    createCanvas(innerWidth,innerHeight);
    
    //FRAME RATE
    frameRate(FPS)
    
    
    function  Player() {
    
        //THE MAIN PLAYER OBJECT
        
        //player effects
        
        this.shield = false
        
        
        //properties
        this.x = 100
        this.y = height/2
        
        this.w = 40
        this.h = 30
        
        this.aceleration = 1.3
        
        this.fallSpeed = gravity
        
        this.speed = 5
        
        this.hp = 100
        
        this.isWorking = true
        
        //info
        this.gasTriggerUp = false
        
        this.draw = ()=>{
            fill(155)
            noStroke()
            //spaceship
            rect(this.x-this.w/2,this.y-this.h/2,this.w,this.h)
            fill(80)
            rect(this.x-5,this.y-10,20,10)
            
            
            //Gas animation
            //Going Up
            if(this.gasTriggerUp) {
                noStroke()
                
                    fill(gasEffect1+"aa")
                    rect(this.x*0.9,this.y+this.h-15,10,30)
                    
                if(frameCount % 5 == 0) {
                    fill(gasEffect1+"55")
                    rect(this.x/1.4,this.y+this.h-20,20,50)
                }
            }
            //Going Down
            if(this.gasTriggerDown) {
                noStroke()
                fill(gasEffect2+"aa")
                rect(this.x*0.9,this.y-this.h-15,10,30)
                  
                  
                if(frameCount % 5 == 0) {
                    fill(gasEffect2+"55")
                    rect(this.x/1.4,this.y-this.h-30,20,50)
                }
                
            }
            
            //Going front
            if(frameCount % 5 == 0) {
                fill(gasEffect1)
                rect(this.x-this.w-10,this.y-10,30,15)
            }
            
            //Render Shield
            if(this.shield) {
                fill("#0ff3")
                ellipse(this.x,this.y,100,100,100)
            }
            
        }
        
        this.update = ()=>{
            //Handle when player is dead
            if(this.hp <= 0) {
                gameOver()
                this.isWorking = false
            }
            //Handle When Touch/click top screen
            if(this.gasTriggerUp) {
                this.fallSpeed  = gravity / 2
            }else{
                this.fallSpeed = gravity
            }
            
            //Apply gravity
            if(this.y < height - this.h) {
                this.y += gravity
            }
            
            //Handle When Touch/click top screen
            if(this.gasTriggerUp && player.y >= 0 &&
            this.isWorking) 
            {
            
                player.y -= player.speed
            
               
            }else if( this.gasTriggerDown 
            && player.y <= height - player.h 
            && this.isWorking ) 
            {
            //Handle When Touch/click bottom screen
                player.y += player.speed
            }
            
            
        }
        //Switch the Machine to gasUp or gasDown
        this.gasUp = () =>{
        
            this.gasTriggerUp = true  
            
        }
        //Switch the Machine to gasUp or gasDown
        this.gasDown = () =>{
        
            this.gasTriggerDown = true
        
        }
        
        //Handle When Player get Damage
        this.getDamage = () =>{
            
            this.hp -= 10
                
        }
        
    }
    
    //INSTANCES
    
    //player GLOBAL INSTANCE
    player = new Player()
    playerHitBox = new HitBox(
            player.x,
            player.y,
            playerCollisionRadius,
            "red",
            player
    )
    
    //STORE ALL ROCKS DISPLAYED ON SCREEN
    rocks = []
    
    //STORE ALL STARS DISPLAYED ON SCREEN
    starsList = []
    
    //STORE ALL HITBOXES ON SCREEN
    rocksHitbox = []
    
    //STORE ALL ITEMS HITBOXES
    itemsHitbox = []
    
    //STORE ALL CURRENT PARTICLES
    rocksParticles = []
    
    //STORE ALL CURRENT ITEMS
    itemsAvaliable = []
    
    //GLOBAL INSTANCE OF SCREEN OBJECT
    screen = new Screen()
    
    
    ///initial stars were here
} 

//GAME LOOP
function draw() {
    //debug visual
    
    if(debug) {
        
        rocks.forEach((rock)=>{
            
            stroke("red")
            line(rock.x,rock.y,player.x,player.y)
            
            
        })
           
        itemsAvaliable.forEach((item)=>{
            
            stroke("cyan")
            line(item.x,item.y,player.x,player.y)
            
            
        })
            
            stroke("black")
 
    }
    
    //LAYER 1 -BACKGROUND
    
    background(backgroundColor)
    
    
    //LAYER 2 - STARS
    
    //star generator
    if(frameCount % 4 == 0 && starsGenerate) {
        starsList.push(new Star())
    }
    for(let i=0;i<starsList.length;i++) {
        starsList[i].draw()
        starsList[i].update()
        
        if(starsList[i].x < 0) {
            starsList.splice(i,1) 
        }
    }
    
    //LAYER 3 - PLAYER
    
    //player
    player.draw()
    player.update()
    
    //player hitbox
    if(debug) {
        playerHitBox.draw()
    }
    playerHitBox.update()
    
    //LAYER 4 - ROCKS
    for(var i=0;i<rocks.length;i++) {
        rocks[i].draw()
        rocks[i].update()
        
        //rocks hitbox Update
        if(debug){
            rocksHitbox[i].draw()
        }
        rocksHitbox[i].update()
        //rocks hitbox updates but its not shown
        
       //check on collision
               if(rocksHitbox[i].checkCollisionWith(playerHitBox)) {
            if(!player.shield)
                player.getDamage()
            
            //ROCKS PARTICLES
            
            let particle = new Particles(rocks[i].x,rocks[i].y,rocksColor)
            
            //Intensity depends on rocks size
            particle.intensity = rocks[i].radius
            particle.size = rocks[i].radius/4
            
            rocksParticles.push(particle)
            
            //Destroy rock when player hit it
            rocks[i].destroy()
            
        }
        
        //remove rocks offscreen
        if(rocks[i].x + rocks[0].radius < 0) {
            rocks.splice(i,1)
            rocksHitbox.splice(i,1)
        }
        
    }
    //ROCK GENERATOR LOOP
    if(frameCount % floor(random(30,60)) == 0 &&
    !gameOverTrigger) {
    
        let newRock = new Rock()
        
        rocks.push(newRock)
        rocksHitbox.push(
             new HitBox(
             newRock.x,newRock.y,newRock.radius,"blue",newRock)
        )
    }
      
    //Shield generator
    if(frameCount % 1500 == 0 && !gameOverTrigger) {
        
        let shield = new Item()
        
        itemsHitbox.push(new HitBox(
            
            shield.x,
            shield.y,
            30,
            "red",
            shield
        ))
        
        itemsAvaliable.push(shield)
         
    }
    //Render Items
    itemsAvaliable.forEach((item)=>{
        
        item.draw()
        item.update()
        
    })
    
    //Check Items collision with players
    itemsAvaliable.forEach((item)=>{
 
        
    itemsHitbox.forEach((hitbox) => {
        
    hitbox.update()
    if(hitbox.checkCollisionWith(playerHitBox))
    {
        player.shield = true
            
        itemsAvaliable.pop()
            
        itemsHitbox.pop()
    }
    })
    
        
    })
    //remove shield
    if(frameCount % 1000 == 0 && player.shield) {
        player.shield = false
    }
    
    //LAYER 6 - PARTICLES
    
    //RENDER & GENERATE ALL PARTICLES
    for(let i=0;i<rocksParticles.length;i++) {
        
        rocksParticles[i].draw()
        rocksParticles[i].update()
        
        if(rocksParticles[i].x < 0) {
            rocksParticles.splice(i,1)
            
        }
        
    }
    
    //LAYER 7 - UI SCREEN
    screen.draw()
    screen.update()
    
    changeLocation()
    
    //GAME DIFFICULT BASED ON TIME
    if(frameCount % 500 == 0) {
        if(gameDifficult < gameDifficult_LIMIT)
            gameDifficult += 1
    } 
}

function mousePressed() {
    //MAP CLICK/TOUCH EVENT
    if(mouseY < height/2) {
        player.gasUp()
    }else if(mouseY > height/2){
        player.gasDown()
    }
    
}

function mouseReleased() {
    //HANDLE RELEASE
    player.gasTriggerUp = false
    player.gasTriggerDown = false
    
}

let topTrigger = true
let bottomTrigger = false

function changeLocation() {
    
    if(player.y < 100 && topTrigger) {
    
        gravity = 0
        currentLocation = "space"
        backgroundColor = "#00002266"
        
        player.y = height - 110
        
        starsGenerate = true
        
        //DISPLAY 54 INITIAL STARS ON THE SCREEN
        
        topTrigger = !topTrigger
        bottomTrigger = !bottomTrigger
        
    }
    
    else if(player.y > height - 100 && bottomTrigger) 
    {
    
        gravity = 2
        currentLocation = "earth"
        backgroundColor = "skyblue"
        player.y = 110 
        starsGenerate = false
        
        topTrigger = !topTrigger
        bottomTrigger = !bottomTrigger
    }
    
}

function gameOver() {
    //HANDLE GAME OVER EVENT
    gameOverTrigger = true
}
