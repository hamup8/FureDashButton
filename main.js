/*
 * runstant
 */

phina.globalize();

var ASSETS = {
  image: {
    'fure'                  : './img/fure_R.png',
    'fure_R_plus'           : './img/fure_R_plus.png',
    'fure_SR_meido'         : './img/fure_SR_meido.png',
    'fure_SR_meido_plus'    : './img/fure_SR_meido_plus.png',
    'fure_SR_tulip'         : './img/fure_SR_tulip.png',
    'fure_SR_tulip_plus'    : './img/fure_SR_tulip_plus.png',
    'fure_SSR_avenue'       : './img/fure_SSR_avenue.png',
    'fure_SSR_avenue_plus'  : './img/fure_SSR_avenue_plus.png',
    'fure_SSR_lumiere'      : './img/fure_SSR_lumiere.png',
    'fure_SSR_lumiere_plus' : './img/fure_SSR_lumiere_plus.png',
    'fure_cracker'          : './img/fure_cracker.png',
    'fure_humming'          : './img/fure_humming.png'
  },
  sound: {
    mainsound: './bgm/main_sound.mp3'
  },
};

var fure_array = ['fure'           , 'fure_R_plus'          , 'fure_SR_meido'  , 'fure_SR_meido_plus'  ,
                 'fure_SR_tulip'   , 'fure_SR_tulip_plus'   , 'fure_SSR_avenue', 'fure_SSR_avenue_plus',
                 'fure_SSR_lumiere', 'fure_SSR_lumiere_plus'];

var SCREEN_WIDTH  = 640;
var SCREEN_HEIGHT = 960;
var KOMA_IMAGE_WIDTH = 520;
var KOMA_IMAGE_HEIGHT = 385;
var PUCHI_IMAGE_WIDTH = 200;
var PUCHI_IMAGE_HEIGHT = 360;
var BACK_COLOR = '#F5A9A9';
var gotRank = false;
var thisResult;
var rankTimeout;

phina.define('TitleScene', {
  superClass: 'DisplayScene',

  init: function() {
    this.superInit();
    this.backgroundColor = BACK_COLOR;
    exclusive_flg = 0;

    this.fromJSON({
      'children': {
        'titlelabel': {
          'className': 'Label',
          'arguments': ['フレデリカ DASH ボタン!!'],
          'x': SCREEN_WIDTH / 2 ,
          'y': SCREEN_HEIGHT / 2 - 300,
          'fill': 'white',
          'fontSize': 45
        },
        'fureCracker': {
          'className': 'Sprite',
          'arguments': ['fure_humming'],
          'x': SCREEN_WIDTH / 2 ,
          'y': SCREEN_HEIGHT / 2,
          'width': KOMA_IMAGE_WIDTH,
          'height': KOMA_IMAGE_HEIGHT
        },
        'touchlabel': {
          'className': 'Label',
          'arguments': ['TOUCH START'],
          'x': SCREEN_WIDTH / 2 ,
          'y': SCREEN_HEIGHT / 2 + 300,
          'fill': 'white',
          'stroke': false,
          'fontSize': 45
        },
      },
    });

    this.on('pointstart', function() {
      if(exclusive_flg == 0){
        exclusive_flg = 1;
      } else if(exclusive_flg == 1){
        return;
      }
      this.exit();
    });
  },
});

phina.define('MainScene', {
  superClass: 'DisplayScene',

  init: function() {
    this.superInit();

    this.msec = 0;
    this.sec = 1;
    touch_count = 0;
    game_sec = 10;
    array_count = 0;

    this.fromJSON({
      'children': {
        'countlabel': {
          'className': 'Label',
          'arguments': [touch_count + ' フンフフーン♩'],
          'x': SCREEN_WIDTH / 2 ,
          'y': SCREEN_HEIGHT / 2 - 300,
          'fill': 'white',
          'fontSize': 45
        },
        'fure': {
          'className': 'Sprite',
          'arguments': [fure_array[0]],
          'x': SCREEN_WIDTH / 2 ,
          'y': SCREEN_HEIGHT / 2,
          'width': PUCHI_IMAGE_WIDTH,
          'height': PUCHI_IMAGE_HEIGHT
        },
        'desclabel': {
          'className': 'Label',
          'arguments': ['フレちゃんを連打しよう！'],
          'x': SCREEN_WIDTH / 2 ,
          'y': SCREEN_HEIGHT / 2 - 350,
          'fill': 'white',
          'fontSize': 45
        },
        'secondlabel': {
          'className': 'Label',
          'arguments': ['残り時間: ' + game_sec + '秒'],
          'x': SCREEN_WIDTH / 2 ,
          'y': SCREEN_HEIGHT / 2 + 300,
          'fill': 'white',
          'fontSize': 45
        },
      },
    });

    this.backgroundColor = BACK_COLOR;
    SoundManager.playMusic('mainsound');
    self = this;
    self.fure.setInteractive(true);
    self.fure.onpointstart = function() {
      touch_count += 1;
      self.countlabel.text = touch_count + ' フンフフーン♩';
      self.fure.tweener.scaleTo(1.1, 50).play();
      self.fure.tweener.scaleTo(1.0, 50).play();

      if(touch_count % 10 == 0){
        if(array_count < fure_array.length - 1){
          array_count += 1;
        }
        self.fure.setImage(fure_array[array_count], PUCHI_IMAGE_WIDTH, PUCHI_IMAGE_HEIGHT);
      }
    };
  },

  update: function(app){
    this.msec += app.deltaTime;
    if(this.msec >= this.sec * 1000){
      this.secondlabel.text = '残り時間: ' + (game_sec - this.sec) + '秒';
      this.sec++;
      if(this.sec === game_sec + 1){
        this.gameover();
      }
    }
  },

  gameover: function(){
    SoundManager.stopMusic();
    gotRank = false;
    this.getRank();
    this.exit({
      score: touch_count,
      ranking: '取得中...',
      hashtags: 'フレデリカDASHボタン'
    });
  },

  getRank: function(){
    rankTimeout = window.setTimeout(failedToFetch, 20000);
    var script = phina.asset.Script();
    var src = 'https://script.google.com/macros/s/AKfycbw_ZK5uLM2Vh_OmWZfgQk5UiNxp_twE5FeRrkvGuHLjIETOxtoh/exec?';
    src += 'score='+touch_count+'&callback=cameRankData';
    script.load(src);
  },
});

function cameRankData(json){
  window.clearTimeout(rankTimeout);
  var newMessage = 'ランキング: '+json.rank + ' / ' + json.allrank + '位';
  thisResult.rankingLabel.text = newMessage;
  gotRank = true;
}

function failedToFetch(){
  thisResult.rankingLabel.text = 'ランキング: 取得失敗';
}

phina.define('ResultScene',{
  superClass: 'DisplayScene',

  init: function(params){
    this.superInit(params);

    params = ({}).$safe(params, phina.game.ResultScene.defaults);
    var message = params.message.format(params);
    thisResult = this;

    this.fromJSON({
      'children': {
        'scoreText': {
          'className': 'phina.display.Label',
          'arguments': {
            'text': 'スコア： ' + params.score + ' フンフフーン♩',
          },
          'x': SCREEN_WIDTH / 2 ,
          'y': SCREEN_HEIGHT / 2 - 350,
          'fontSize': 45,
          'fill': 'white'
        },
        'fureCracker': {
          'className': 'Sprite',
          'arguments': ['fure_cracker'],
          'x': SCREEN_WIDTH / 2 ,
          'y': SCREEN_HEIGHT / 2,
          'width': KOMA_IMAGE_WIDTH,
          'height': KOMA_IMAGE_HEIGHT
        },
        'rankingLabel': {
          'className': 'phina.display.Label',
          'arguments': {
            'text': 'ランキング： ' + params.ranking,
            'fill': 'white',
            'fontSize': 45,
          },
          'x': this.gridX.span(8),
          'y': this.gridY.span(3.5),
        },
        'shareButton': {
          'className': 'phina.ui.Button',
          'arguments': [{
            'text': '★',
            'width': 128,
            'height': 128,
            'fontSize': 50,
            'cornerRadius': 64,
            'fill': 'rgba(240, 240, 240, 0.5)',
          }],
          'x': this.gridX.center(-3.5),
          'y': this.gridY.span(13),
          'interactive': true,
        },
        'playButton': {
          'className': 'phina.ui.Button',
          'arguments': [{
            'text': '▶',
            'width': 128,
            'height': 128,
            'fontSize': 50,
            'cornerRadius': 64,
            'fill': 'rgba(240, 240, 240, 0.5)',
          }],
          'x': this.gridX.center(3.5),
          'y': this.gridY.span(13),
          'interactive': true,
          onpush: function() {
            this.exit();
          }.bind(this),
        },
        'pollButton': {
          'className': 'phina.ui.Button',
          'arguments': [{
            'text': '投票',
            'width': 128,
            'height': 128,
            'fontSize': 50,
            'cornerRadius': 64,
            'fill': 'rgba(240, 240, 240, 0.5)',
          }],
          'x': this.gridX.center(),
          'y': this.gridY.span(13),
          'interactive': true,
        },
      },
    });
    this.backgroundColor = BACK_COLOR;

    this.shareButton.onclick = function() {
      var score_text = this.parent.scoreText.text + 'フレデリカ〜♩';

      if(gotRank){
        result_text = '{0}\n{1}\n'.format(score_text, this.parent.rankingLabel.text);
      }else{
      var result_text = score_text;
      }
      var url = phina.social.Twitter.createURL({
          text: result_text,
          hashtags: params.hashtags,
          url: params.url,
        });
        window.open(url, 'share window', 'width=480, height=320');
    };
    this.pollButton.onclick = function() {
      var url = 'http://sp.pf.mbga.jp/12008305/?guid=ON&url=http%3A%2F%2F125.6.169.35%2Fidolmaster%2Fvote%2Findex%2F200007%2F1%2F0%2F0%3Fl_frm%3DVote_1%26rnd%3D461647559'
      window.open(url, 'share window', 'width=480, height=320');
    };
  },
});

phina.main(function() {
  var app = GameApp({
    title: 'フレデリカDASHボタン',
    startLabel: 'title',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    assets: ASSETS,
  });

  /* iphone BGM対応 */
  app.domElement.addEventListener('touchend', function dummy() {
    var s = phina.asset.Sound();
    s.loadFromBuffer();
    s.play().stop();
    app.domElement.removeEventListener('touchend', dummy);
  });

  app.run();
});
