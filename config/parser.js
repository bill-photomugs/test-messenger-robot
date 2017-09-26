module.exports = class Parser{
  constructor(){
    this.image   = '';
    this.product = [];
  }
  hello() {
    console.log("hello world");
  }

  renderImage(image){
    this.image    = image;
    this.products = [
      {
        sku: "21108-3",
        title: "20 oz. Ceramic Jumbo Mug",
        subtitle: "Holding 20 oz. of your favorite beverage, hot or cold, Jumbo Mug lets you be in charge with a smooth and comfortable 'C-handle'",
        item_url: "",
        image_url: "",
        url: "http://www.vivoprint.com/product/20oz_ceramic_jumbo_mug",
        x: -21,
        y: -40,
        width: 296,
        height: 222,
        angle: 270,
        renderWidth: 400,
        renderHeight: 171.5
      },{
        sku: "59000",
        title: "Photo Slate Small",
        subtitle: "Photo Slate Small",
        item_url: "",
        image_url: "",
        url: "http://www.vivoprint.com/product/custom-photo-slate-small-square",
        x: 1,
        y: 49,
        width: 388,
        height: 291,
        angle: 0,
        renderWidth: 388,
        renderHeight: 388
      }
    ];
    this.setProductImage();
  }

  setProductImage(){
    for(let i=0; i< this.products.length; i++){
      let product  = this.products[i];
      let imageUrl = this.parseImage(product);
      this.products[i].item_url  = imageUrl;
      this.products[i].image_url = imageUrl;
    }
  }

  parseImage(product){
    var Base64 = {_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/rn/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
    let pxUrl  = "http://px.vivoprint.com/preview.jpg?base64=";
    console.log("this.image:" , this.image)
    console.log("product:" , product)
    let params = JSON.stringify({
      "layers": [{
          "x": product.x,
          "y": product.y,
          "width": product.width,
          "height": product.height,
          "src": this.image,
          "rotation": 0,
          "type": "image"
      }],
      "t_layers": [null, null, null, null, null, null, null, null, null],
      "product": product.sku,
      "angle": product.angle,
      "size": "big",
      "width": product.renderWidth,
      "height": product.renderHeight,
      "print_width": 7.72,
      "print_height": 3.31,
      "bleed_w": 0.115,
      "bleed_h": 0.075
    });
    let paramsBase64 = new Buffer(params).toString("base64");
    return (pxUrl + paramsBase64);
  }

  setMessageElements(){
    let elements = []
    this.products.forEach(product => {

      elements.push({
        title: product.title,
        subtitle: product.subtitle,
        item_url: product.item_url,               
        image_url: product.image_url,
        buttons: [{
          type: "web_url",
          url: product.url,
          title: "View Product Details"
        }, {
          type: "postback",
          title: "Call Postback",
          payload: "Payload for first bubble",
        }]
      })

    })
    return elements;

  }
}