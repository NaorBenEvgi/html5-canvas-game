const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = innerWidth
canvas.height = innerHeight

class Player{
    constructor(x,y,radius,color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw(){
        ctx.beginPath(); //specify we want to draw on the screen
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        ctx.fillStyle = this.color
        ctx.fill() 
    }
}

class Projectile {
    //the projectile is a circle we shoot from the center of the screen
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        ctx.beginPath(); //specify we want to draw on the screen
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        ctx.fillStyle = this.color
        ctx.fill() 
    }
    
    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy {
    constructor(x,y,radius,color,velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw(){
        ctx.beginPath(); //specify we want to draw on the screen
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        ctx.fillStyle = this.color
        ctx.fill() 
    }
    
    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

const x = canvas.width / 2
const y = canvas.height / 2
const player = new Player(x,y,10,'white')



const projectiles = []
const enemies = []

function spawnEnemies(){
    setInterval(() => {
        const radius = Math.random() * (30-4) + 4 //enemy size between 4 to 30
        let x
        let y
        if(Math.random() < 0.5){ //50:50 chance
            //if it spawn from the right or left of the screen, y position should be anywhere from 0 to the full canvas height 
            x = Math.random() < 0.5 ? 0 - radius: canvas.width + radius //start randomally right or left of the canvas
            y = Math.random() * canvas.height

        }else{
            //if it spawn from the top or bottom of the screen, x position should be anywhere from 0 to the full canvas width 
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius: canvas.height + radius
        }
        const color = `hsl(${Math.random()*360},50%,50%)` //input computation within the string
        const angle = Math.atan2(canvas.height/2 - y, canvas.width/2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x,y,radius,color,velocity))
    }, 1000)
}

let animationId
function animate(){
    animationId = requestAnimationFrame(animate) //returns what frame are you currently on
    ctx.fillStyle = 'rgba(0,0,0,0.1)'
    ctx.fillRect(0, 0, canvas.width, canvas.height); //clear html5 canvas
    player.draw()
    projectiles.forEach((projectile, projectileIndex) => {
        projectile.update()
        //remove projectiles from edges of screen
        if(projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height ){
            setTimeout(()=>{
                projectiles.splice(projectileIndex, 1) //clear the projectile
            },0)
        }
    })
    enemies.forEach((enemy, enemyIndex) => {
        //For removing enemy object, use forEach automatic indexing by adding a second argument 'index'
        enemy.update()
        //enemy touch player
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y) //compute distance between enemy and player
        if (dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId)
        }
        //check if the projectile touched an enemy - for each enemy within the loop we want to test the distance between each projectile
        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y) //distance between 2 points
            if (dist - enemy.radius - projectile.radius < 1){
                //when prokectiles touch enemy
                if(enemy.radius > 15){
                    gsap.to(enemy, { //nice shrinking effect with gsap
                        radius: enemy.radius - 10
                    })
                    // enemy.radius -= 10
                    setTimeout(()=>{
                        projectiles.splice(projectileIndex, 1) //clear the projectile
                    },0)
                }else{
                    setTimeout(()=>{
                        enemies.splice(enemyIndex,1) //clear the enemy
                        projectiles.splice(projectileIndex, 1) //clear the projectile
                    },0)
                }
            }
        })
    })
}

window.addEventListener('click', (event)=>{
    const angle = Math.atan2(event.clientY - canvas.height/2, event.clientX - canvas.width/2)
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }
    projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white',velocity))
})

animate()
spawnEnemies()