const puppeteer = require('puppeteer');
var arguments = process.argv.splice(2);


if(arguments.length<2){
    console.log('参数必须大于两个')
    return;
}
// http://127.0.0.1:5500/html/article/cc3d2502-dd9e-4c4d-b3f9-17dc50962c5b.html
(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try{
        console.log("准备生成文件"+arguments[1])
        const page = await browser.newPage();
        await page.goto(arguments[0], {waitUntil: 'networkidle2'});
        await page.addStyleTag({ content: ".card { display: none} @page{margin: 27mm 16mm 27mm 16mm;}  #header{display:none} @font-face{font:'abc';src: url('./abc.ttf')} *{font-family: '楷体'}" })
        await page.pdf({path: arguments[1],format: 'A4'});
        await browser.close();
        console.log("生成成功!!")
    }catch(err){
        console.log('发生错误'+err);
        await browser.close();
    }
  
})();