try {
    if (typeof AudioContext !== 'undefined') {
        audioContext = new AudioContext();
        canUseWebAudio = true;
    } else if (typeof webkitAudioContext !== 'undefined') {
        audioContext = new webkitAudioContext();
        canUseWebAudio = true;
    }
    if (/iPad|iPhone|iPod/.test(navigator.platform)) {
        this._unlockiOSaudio();
    }
    else {
        audioUnlocked = true;
    }
} catch (e) {
    console.error("Web Audio: " + e.message);
}

var playSound = function (buffer, time) {
  var source = audioContext.createBufferSource();
  source.buffer = buffer;

  source.connect(audioContext.destination);
  if (!source.start)
    source.start = source.noteOn;
  source.start(time);
};

var loadSoundFile = function (url, i) {
    if (canUseWebAudio) {
        var that = this;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function (e) {
            that.audioContext.decodeAudioData(this.response,
            function (decodedArrayBuffer) {
                sounds[i] = decodedArrayBuffer;
                if (that.callback) {
                    that.callback();
                }
            }, function (e) {
                console.log('Error decoding file', e);
            });
        };
        xhr.send();
    }
};

var sounds_src = [
  'sounds/1.wav',
  'sounds/2.wav',
  'sounds/3.wav',
  'sounds/4.wav',
  'sounds/5.wav',
  'sounds/6.wav',
  'sounds/7.wav',
  'sounds/8.wav',
  'sounds/9.wav',
  'sounds/10.wav',
  'sounds/11.wav',
  'sounds/12.wav'
];

if (canUseWebAudio) {
    for (var i = 0, len = sounds_src.length; i < len; i++) {
      loadSoundFile(sounds_src[i], i);
    }
}

var resizePad = function () {
  $('section div.pad').css({
    height: (window.innerHeight - $('menu').height()) / 4
  });
  $('#time div.time').css({
    height: $('#time div.time').width()
  });
};

$(window).on('resize', resizePad);

resizePad();

var sounds = [];
var waitingTime = false;
var timeOpen = false;
var currentPad = false;
var time = 4;
var pads = [];

for (var i = 0, len = $('.pad').length; i < len; i++) {
  pads.push([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
}

$('.time-toggle').click(function() {
  $('.pad div.pad-c i').fadeToggle();
  if (timeOpen) {
      return;
  }
  $(this).toggleClass('active');
  waitingTime = !waitingTime;
});

Waves.attach('.pad-c', 'waves-light');
Waves.init();

$('section div.pad div.pad-c').click(function() {
  if (waitingTime) {
    timeOpen = true;
    currentPad = $('section div.pad div').index(this);
    $('#time div.time').each(function(i) {
      if (pads[currentPad][i]) {
        $(this).addClass('active');
      } else {
        $(this).removeClass('active');
      }
    });
    $('.pad-number').text(currentPad + 1);
    $('#time').css('transform', 'translateX(0%)');
  } else {
    playSound(sounds[$('section div.pad div').index(this)], 0);
  }
});

$('#time h1 i.fa-times').click(function() {
  $('.time-toggle').toggleClass('active');
  waitingTime = !waitingTime;
  $('.pad div.pad-c i').fadeOut();
  timeOpen = false;
  $('#time').css('transform', 'translateX(-100%)');
});


$('#time div.time').click(function() {
  pads[currentPad][$('#time div.time').index(this)] = !pads[currentPad][$('#time div.time').index(this)];
  $(this).toggleClass('active');
});

 setInterval(function() {
   $('menu .timer').finish().css('width', '0%');
   $('menu .timer').animate({width: '105%'}, 4000, 'linear');
   var startTime = audioContext.currentTime;
   for (var i = 0, len = pads.length; i < len; i++) {
     for (var o = 0, lenO = pads[i].length; o < lenO; o++) {
       if (pads[i][o]) {
         playSound(sounds[i], startTime + o / 4);
         setTimeout((function(i) {
           return function() {
             Waves.ripple('.pad-c.pad-n-' + (i + 1));
           };
         })(i), (o / 4) * 1000);
       }
     }
   }
 }, 4000);
