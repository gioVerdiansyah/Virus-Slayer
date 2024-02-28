const root = document.getElementById('root');

const VirusSlayer = () => {
    const methods = {};
    const obj = {};
    const data = JSON.parse(localStorage.getItem('virus_slayer'));

    let intervalBag = [];

    // init
    let countDown = 4;
    obj.username = null;
    methods.initVar = () => {
        obj.second = 0;
        obj.minute = 0;

        obj.score = 0;
        obj.health = 5;

    }

    methods.initVar();

    methods.initGame = () => {

        root.innerHTML = `
            <div id="init_game">
                    <div class="card">
                        <h1>Instruction Virus Slayer</h1>
                        <ol>
                            <li>Input Username and click play</li>
                            <li>Destroy virus with D F J K Key</li>
                            <li>Reach High Score</li>
                            <li>Enjoy</li>
                        </ol>

                        <div id="input_name_container">
                            <input type="text" placeholder="Enter Name" id="username" autofocus>
                            <button type="button" id="play">Play</button>
                        </div>
                    </div>
            </div>
        `;
        document.getElementById('play').addEventListener('click', function () {
            VirusSlayer().playGame();
        });
    }

    methods.playGame = (isResume = false) => {
        if (!isResume) {
            if (!JSON.parse(localStorage.getItem('virus_slayer'))) {
                const nameUser = document.getElementById('username').value;
                if (nameUser.trim() === "") {
                    alert("Nama tidak boleh kosong");
                } else {
                    obj.username = nameUser;
                    localStorage.setItem('virus_slayer', JSON.stringify(obj));
                }
            }
            root.innerHTML = `    
        <div id="play_game">
        <h2 id="countDown"></h2>
        <div id="descriptions">
            <h1>Time: <span id="time">00:00</span></h1>
            <h1>Score: <span id="score">0</span></h1>
            <h1>Health: <span id="health">${obj.health}</span></h1>
            <h1>Player: <span id="name"></span></h1>

            <div class="menu">
                <h2>Virus Slayer</h2>
                <button id="restart">Restart</button>
                <button id="quit">Quit</button>
            </div>
        </div>
        <div id="lines_parent">
            <div id="lines">
                <div id="line_1"></div>
                <div id="line_2"></div>
                <div id="line_3"></div>
                <div id="line_4"></div>
            </div>
            <div id="action_button">
                <div id="line_d">D</div>
                <div id="line_f">F</div>
                <div id="line_j">J</div>
                <div id="line_k">K</div>
            </div>
        </div>
        <div id="right_descriptions"></div>
    </div>`;

            if (data) {
                obj.username = data.username;
                obj.second = data.second;
                obj.minute = data.minute;

                obj.score = data.score;
                obj.health = data.health;

                document.getElementById('health').innerText = obj.health;
                document.getElementById('name').innerText = obj.username;
                document.getElementById('score').innerText = obj.score;
                document.getElementById('time').innerText = `${String(obj.minute).padStart(2, '0')}:${String(obj.second).padStart(2, '0')}`;
            }
        }

        document.getElementById('restart').addEventListener('click', function () {
            methods.restart();
        });

        document.getElementById('quit').addEventListener('click', function () {
            methods.quit();
        });

        methods.detect();

        document.getElementById('name').innerText = obj.username == null ? data.username : obj.username;

        const secondInterval = setInterval(() => {
            if (countDown === 0) {
                let line = Math.floor(Math.random() * 4) + 1;
                methods.addEnemy(line);
                obj.second += 1;
                if (obj.second >= 60) {
                    obj.second = 0;
                    obj.minute += 1;
                };
                document.getElementById('time').innerText = `${String(obj.minute).padStart(2, '0')}:${String(obj.second).padStart(2, '0')}`;

                methods.save();
            } else {
                countDown -= 1;
                document.getElementById('countDown').innerText = countDown;
                if (countDown <= 0) document.getElementById('countDown').remove();
            }
        }, 1000);

        intervalBag.push(secondInterval);

        methods.ifPause(secondInterval);
    }

    methods.addEnemy = (line) => {
        let lines = document.getElementById(`line_${line}`);
        let img = document.createElement('img');
        img.setAttribute('src', './resources/assets/virus.png');
        img.setAttribute('id', 'virus');

        let topI = 0;

        const imgInterval = setInterval(() => {
            img.style.top = `${topI++}px`

            const actionButtonRect = document.getElementById('action_button').getBoundingClientRect();
            const linesParentRect = document.getElementById('lines_parent').getBoundingClientRect();
            const virusRect = img.getBoundingClientRect();

            if (virusRect.bottom > actionButtonRect.top || virusRect.bottom > linesParentRect.bottom) {
                img.remove();
                clearInterval(imgInterval);
                obj.health -= 1;
                if (obj.health <= 0) {
                    methods.gameOver();
                }
                document.getElementById('health').innerText = obj.health;
            }

            let fireElement = document.querySelectorAll('#action_button span#fire');
            fireElement.forEach((item) => {
                if (methods.isColliding(item, img)) {
                    img.remove();
                    item.remove();
                    obj.score = obj.score + 1;
                    document.getElementById('score').innerText = obj.score;
                    clearInterval(imgInterval);
                    clearInterval(item.fireInterval);
                }
            })

        }, 1);

        intervalBag.push(imgInterval);

        methods.ifPause(imgInterval);

        lines.append(img);
    }

    methods.detect = () => {
        let canClick = true;
        document.addEventListener('keydown', function (e) {
            if (canClick) {
                switch (e.code) {
                    case 'KeyD':
                        methods.fire('d');
                        canClick = false;
                        setTimeout(() => {
                            canClick = true;
                        }, 500);
                        break;
                    case 'KeyF':
                        methods.fire('f');
                        canClick = false;
                        setTimeout(() => {
                            canClick = true;
                        }, 500);
                        break;
                    case 'KeyJ':
                        methods.fire('j');
                        canClick = false;
                        setTimeout(() => {
                            canClick = true;
                        }, 500);
                        break;
                    case 'KeyK':
                        methods.fire('k');
                        canClick = false;
                        setTimeout(() => {
                            canClick = true;
                        }, 500);
                        break;
                }
            }
        });
    }

    methods.fire = (line) => {
        let thisLine = document.getElementById(`line_${line}`);

        const fireElement = document.createElement('span');
        fireElement.setAttribute('id', 'fire');

        let index = 70;
        fireElement.style.transform = `translateY(-${index}px)`;

        const fireInterval = setInterval(() => {
            index += 2;
            fireElement.style.transform = `translateY(-${index}px)`;

            let virusElement = document.querySelectorAll('#lines img');
            virusElement.forEach((item) => {
                if (methods.isColliding(fireElement, item)) {
                    fireElement.remove();
                    item.remove();
                    obj.score = obj.score + 1;
                    document.getElementById('score').innerText = obj.score;
                    clearInterval(fireInterval);
                    clearInterval(item.imgInterval);
                }
            })

            if (index >= ((thisLine.offsetHeight * 2) - 20)) {
                fireElement.remove();
                clearInterval(fireInterval);
            }

        }, 1);

        intervalBag.push(fireInterval);

        methods.ifPause(fireInterval);

        thisLine.append(fireElement);
    }

    methods.isColliding = (element1, element2) => {
        const rect1 = element1.getBoundingClientRect();
        const rect2 = element2.getBoundingClientRect();

        return !(
            rect1.right < rect2.left ||
            rect1.left > rect2.right ||
            rect1.bottom < rect2.top ||
            rect1.top > rect2.bottom
        );
    }

    methods.restart = () => {
        methods.initVar();
        obj.username = data.username;
        localStorage.setItem('virus_slayer', JSON.stringify(obj));

        document.getElementById('health').innerText = '0';
        document.getElementById('score').innerText = '0';
        document.getElementById('time').innerText = '00:00';

        methods.clear();
    }

    methods.clear = () => {
        countDown = 4;

        document.querySelectorAll('#lines img').forEach((item) => {
            item.remove();
        });

        document.querySelectorAll('#action_button span#fire').forEach((item) => {
            item.remove();
        });

        const playGameContainer = document.getElementById('play_game');
        const countDownElement = document.createElement('h2');
        countDownElement.setAttribute('id', 'countDown');

        playGameContainer.prepend(countDownElement);
    }

    methods.quit = () => {
        localStorage.clear('virus_slayer')
        intervalBag.forEach((item) => {
            clearInterval(item);
        })
        interval = [];
        methods.initGame();
    }

    methods.save = () => {
        localStorage.setItem('virus_slayer', JSON.stringify(obj));
    }

    methods.pause = (isGameOver = false) => {
        if (!isGameOver) {
            intervalBag.forEach((item) => {
                clearInterval(item);
            });

            if (document.getElementById('pause') === null) {
                document.getElementById('play_game').insertAdjacentHTML('afterbegin', `
            <div id="pause">
                <div class="card">
                    <h2>Paused</h2>
                    <div class="row">
                        <button type="button" id="continue">Continue</button>
                        <button type="button" id="restart_in_continue">Restart</button>
                    </div>
                </div>
            </div>
        `);

                document.getElementById('continue').addEventListener('click', function () {
                    document.getElementById('pause').remove();

                    methods.continue();
                });
            }

            document.getElementById('restart_in_continue').addEventListener('click', function () {
                document.getElementById('pause').remove();

                methods.restart();
                methods.continue();
            });

        }

    }

    methods.ifPause = (theInterval) => {
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' || e.key === 'Esc') {
                clearInterval(theInterval);
                methods.pause();
            }
        });

    }

    methods.continue = () => {
        methods.clear();
        methods.playGame(true);
    }

    methods.gameOver = () => {
        document.getElementById('play_game').insertAdjacentHTML('afterbegin', `
            <div id="pause">
                <div class="card game_over">
                    <h2>Game Over</h2>
                    <div class="row">
                        <h3>Time: ${String(obj.minute).padStart(2, '0')}:${String(obj.second).padStart(2, '0')}</h3>
                        <h3>Score: ${obj.score}</h3>
                        <h3>Player: ${obj.username}</h3>
                        <button type="button" id="restart_in_continue">Restart</button>
                    </div>
                </div>
            </div>
        `);

        methods.pause();
    }

    return methods;
}