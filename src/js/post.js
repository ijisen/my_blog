(function postHtml(){

  var postContrall = new (function(){
    var post_con = '';
    function PostControl(){
      this.pag_now = 1;
      this.getTrainChildText();
    }
    PostControl.prototype.getTrainChildText = function(){
      console.log(this.pag_now);
      this.pag_now = 10;

    };
    PostControl.prototype.collect = function(){
      console.log(this.pag_now);
    };
    return PostControl;
  }());


}());