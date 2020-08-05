$(function () {
    function strob() {
        couleur = $('.savoir').html('Étudiant').css('color');
        console.log(couleur)
        if (couleur == 'rgb(166, 226, 44)') {
            $('.savoir').html('chAussette').css('color', '#fa9421');
        } else if (couleur == 'rgb(249, 36, 114)') {
            $('.savoir').html('cHaussette').css('color', '#a6e22c');
        } else {
            $('.savoir').html('Chaussette').css('color', '#f92472');
        }
    }
    setInterval(strob, 200);
})