/**
 * Created by jisen on 2017/3/3.
 */


var common = (function () {
  var Common = {};
  /*==============================================
   * +_+ 名称：      返回顶部
   * j_s 编辑人：    jisen
   * r_r 编辑时间：  2017-01-13
   * -_- 说明：
   *   返回顶部
   * ==============================================*/
  Common.returnTop = function () {
    var temp_html = '<div class="return-top"><span class="glyphicon glyphicon-chevron-up" aria-hidden="true"></span></div>';
    var offset = 30,
      _win = $(window),
      _win_height = _win.height(),
      offset_opacity = 1200,
      scroll_top_duration = 700,
      _back_to_top = '';
    $('body').append(temp_html);
    _win.scroll(function(){
      var _scroll_top = $(this).scrollTop();
      if(_scroll_top > offset){
        $('.return-top').show();
        console.log(Math.abs(_win_height - _scroll_top));
      }else{
        $('.return-top').hide();
      }
    });
    $('.return-top').on('click', function(event){
      event.preventDefault();
      $('body,html').animate({
          scrollTop: 0
        }, scroll_top_duration
      );
    });
  };
  /*==============================================
   * +_+ 名称：      返回顶部
   * j_s 编辑人：    jisen
   * r_r 编辑时间：  2017-01-13
   * -_- 说明：
   *   返回顶部
   * ==============================================*/
  Common.setBodyHeight = function (callback){
    _setBody();
    (callback && typeof callback == 'function') && callback();
    $(window).bind('load resize', function(e){
      _setBody()
    });

    function _setBody(){
      var win_height = $(window).height();
      var _body = $('body');
      _body.css("height",win_height);
    }
  };




  return Common;


} ());









(function indexControl(config){
  var common = config;
  //common.add();

})(common);


