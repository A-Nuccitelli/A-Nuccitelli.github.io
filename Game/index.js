/*Declarando o canvas e indicando que ele será 2D */
const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const scoreEl = document.querySelector('#scoreEl');
const startGameEl = document.querySelector('#startGameEl');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl')

/*Adequando o canvas a todos os tamanhos de tela*/
canvas.width = innerWidth
canvas.height = innerHeight

/* Criando uma classe para definir os parametros do personagem */
class Player {
    constructor(x, y, radius, color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }
/* Função de desenho para a classe player */
    draw() {
        c.beginPath() //Para referenciar o canvas sempre é necessario abrir (beginPath)
        c.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill() //Comando p/ desenhar na tela
    }
}
/* Criando uma classe para definir os parametros dos projeteis */
class Projectile {
    constructor (x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity //parametro para definir a movimentação do projeto
    }
    draw() {
        c.beginPath() //Para referenciar o canvas sempre é necessario abrir (beginPath)
        c.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill() //Comando p/ desenhar na tela
    }

/* Função para desenhar e atualizar os projeteis*/
    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y 
    }
}

class Enemy {
    constructor (x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity //parametro para definir a movimentação do projeto
    }
    draw() {
        c.beginPath() //Para referenciar o canvas sempre é necessario abrir (beginPath)
        c.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill() //Comando p/ desenhar na tela
    }

/* Função para desenhar e atualizar os projeteis*/
    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Particle {
    constructor (x, y, radius, color, velocity, alpha) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity //parametro para definir a movimentação do projeto
        this.alpha = 1
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath() //Para referenciar o canvas sempre é necessario abrir (beginPath)
        c.arc( this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill() //Comando p/ desenhar na tela
        c.restore()
    }

/* Função para desenhar e atualizar os projeteis*/
    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

/* Constante para centralizar o player na tela */
const x = canvas.width / 2
const y = canvas.height / 2

/* Constante para inicializar o player */
let player = new Player (x, y, 10, 'white')

/* Constante para inicializar o array dos projeteis */
let projectiles = []

/* Constante para inicializar o array dos inimigos */
let enemies = []

/* Constante para inicializar o array das particulas */
let particles = []

function init() {
    player = new Player (x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = score
    bigScoreEl.innerHTML = score

}

/*Função para gerar inimigos aleatórios*/
function spawnEnemies() {
    setInterval(() => {
        //Constante para definir tamanho aleatório
        const radius = Math.random() * (40-14) + 14


        let x 
        let y 

        //Condicional para aletoriedade do spawn dos inimigos
        if(Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        }else{
            x = Math.random() * canvas.width
            y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }

        const color = `hsl(${Math.random() * 360}, 50%, 50%)`

        /*Comando para encontrar o angulo em radiano do click*/
        const angle = Math.atan2(
        canvas.height / 2 - y,
        canvas.width / 2 - x
        )

        /*Constante para definir o angulo em cosseno e seno*/
        const velocity = {
        x: Math.cos(angle),
        y: Math.sin(angle)
        }

        enemies.push(new Enemy(x , y, radius, color, velocity))
    }, 1000)
}

let animationId
let score = 0

/*Loop para animar a movimentação dos projeteis*/
function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height) //comando para limpar a tela
    player.draw() //comando para desenhar o player
    
    particles.forEach((particle, index) =>{
        if (particle.alpha <= 0 ) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    })
    
    projectiles.forEach((projectile, index) => {
        projectile.update() //chamando a função de desenho e uptade
    
        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {  
                projectiles.splice(index, 1)
            }, 0)
        }
    
    })

    enemies.forEach((enemy, index) =>{
        enemy.update()

        const dist = Math.hypot(
            player.x - enemy.x,
            player.y - enemy.y
        )

        if (dist - enemy.radius - player.radius < 1){
            cancelAnimationFrame(animationId)
            modalEl.style.display = 'flex'
            bigScoreEl.innerHTML = score
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(
                projectile.x - enemy.x,
                projectile.y - enemy.y
            )

            if (dist - enemy.radius - projectile.radius < 1) {
              
                for (let i = 0; i < enemy.radius * 2; i ++){
                    particles.push(new Particle(
                        projectile.x, 
                        projectile.y, 
                        Math.random() * 2, 
                        enemy.color, 
                        {x: (Math.random() - 0.5) * (Math.random() * 5), 
                        y: (Math.random() - 0.5) * (Math.random() * 5)}))
                }
              
                if(enemy.radius -10 > 10){
                    score += 100
                scoreEl.innerHTML = score
                  gsap.to(enemy, {
                      radius: enemy.radius - 10})
                setTimeout(() => {  
                    projectiles.splice(projectileIndex, 1)
              }, 0)
            }else { 
                score += 250
                scoreEl.innerHTML = score             
                setTimeout(() => {  
                enemies.splice(index, 1)
                projectiles.splice(projectileIndex, 1)
              }, 0)
            }
            }   
        })
    })
}

/* Função para ouvir o click do mouse na tela */
addEventListener('click', (event) => {
    
    /*Comando para encontrar o angulo em radiano do click*/
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    )
    /*Constante para definir o angulo em cosseno e seno*/
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    /* Inserindo no array os parametros da classe, sempre que houver um click*/
    projectiles.push(
        new Projectile(
            canvas.width / 2, 
            canvas.height / 2,
            5,
            'red',
            velocity)
    )
})
addEventListener('touchstart', (event) => {
    
    /*Comando para encontrar o angulo em radiano do click*/
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    )
    /*Constante para definir o angulo em cosseno e seno*/
    const velocity = {
        x: Math.cos(angle) * 5,
        y: Math.sin(angle) * 5
    }

    /* Inserindo no array os parametros da classe, sempre que houver um click*/
    projectiles.push(
        new Projectile(
            canvas.width / 2, 
            canvas.height / 2,
            5,
            'red',
            velocity)
    )
})


startGameEl.addEventListener('click', () => {
    init()
    spawnEnemies()
    animate()
    modalEl.style.display = 'none'
})
startGameEl.addEventListener('touchstart', () => {
    init()
    spawnEnemies()
    animate()
    modalEl.style.display = 'none'
})