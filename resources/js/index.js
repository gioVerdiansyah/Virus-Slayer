window.addEventListener('load', function() {
    if (JSON.parse(localStorage.getItem('virus_slayer'))) {
        VirusSlayer().playGame();
    } else {
        VirusSlayer().initGame();
    }
})