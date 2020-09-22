$(document).ready(function () {

    // var code_path = $('#code-path').attr('data-value')
    var code_path = 'generated-code'
    var data_html = ''
    var data_css = ''
    var data_iframe = ''

    /*********************
     *** Nav Options ***
     *********************/
    // change display layout
    $('#opt-layout').on('click', function () {
        let containers = $('.viewer-container')

        // display vertically
        if (! $('#content').hasClass('vertical')){
            $('#content').addClass('vertical')
            containers.removeClass('col-md-6')
            containers.addClass('col-md-12')
            // adjust height
            $('.panel-body').css('height', '40vh')
        }
        // display horizontally
        else {
            $('#content').removeClass('vertical')
            containers.removeClass('col-md-12')
            containers.addClass('col-md-6')
            // adjust height
            $('.panel-body').css('height', '85vh')
        }
    })

    // download files
    $('#opt-download').on('click', function () {
        let zip = new JSZip()

        let export_html = data_html.replace('<style>REPLACEME</style>', '\n<link rel="stylesheet" href="xml.css">\n')
        zip.file('xml.html', export_html)
        zip.file('xml.css', data_css)
        zip.generateAsync({type:"blob"}, function () {
        }).then(function(content) {
            // see FileSaver.js
            saveAs(content, "code.zip");
        });
    })

    /*********************
    *** Coder Rendering ***
     *********************/
    // HTML
    function renderHTMLLine(line) {
        let html = ''
        let content = ''

        let tag = ''
        let search_tag = false
        let quotation = ''
        let search_quotation = false
        for(let i = 0; i < line.length; i++){
            let c = line[i]

            if(search_tag){
                // end the tag by space
                if(c === ' '){
                    html += '<span class="html-tag">' + tag + c + '</span>'
                    tag = ''
                    search_tag = false
                }
                // end the tag by ">"
                else if(c === '>'){
                    html += '<span class="html-tag">' + tag + '</span>' +
                        '<span class="html-bracket">' + c + '</span>'
                    tag = ''
                    search_tag = false
                }
                // record the tag
                else {
                    tag += c
                }
            }
            else if(search_quotation){
                // end the quotation
                if (c === '"'){
                    html += '<span class="html-quotation">' + quotation + c + '</span>'
                    quotation = ''
                    search_quotation = false
                }
                // record the quotation
                else{
                    quotation += c
                }
            }
            else if (c === '"'){
                if(content !== ''){
                    html += '<span>' + content + '</span>'
                    content = ''
                }
                quotation = c
                search_quotation = true
            }
            else if(c === '<'){
                if(content !== ''){
                    html += '<span>' + content + '</span>'
                    content = ''
                }
                html += '<span class="html-bracket">' + c + '</span>'
                search_tag = true
            }
            else if(c === '>'){
                html += '<span>' + content + '</span>'
                html += '<span class="html-bracket">' + c + '</span>'
                content = ''
            }
            else {
                content += c
            }
        }
        return html
    }
    function renderHTML(data){
        let gen_html_lines = data.split('\n');
        let html = ''
        for(let i = 0; i < gen_html_lines.length; i ++){
            let line = gen_html_lines[i]
            line = renderHTMLLine(line)
            // ignore outside stylesheet
            if (line.includes('link')){
                line = '<span class="html-bracket">\t<</span>' +
                    '<span class="html-tag">style</span>' +
                    '<span class="html-bracket">></span>' +
                    'REPLACEME' +
                    '<span class="html-bracket"><</span>' +
                    '<span class="html-tag">/style</span>' +
                    '<span class="html-bracket">></span>'

                html += '<pre style="display: none">' + line + '</pre>'
            }
            else {
                html += '<pre>' + line + '</pre>'
            }
        }
        return html
    }
    // CSS
    function renderCSS(data){
        let html = ''

        let line = ''
        let is_content = false
        for(let i = 0; i < data.length; i ++){
            let c = data[i]

            if (c === '\n'){
                if (is_content){
                    line = '<span class="css-content">' + line + '</span>'
                }
                html += '<pre>' + line + '</pre>'
                line = ''
            }
            else{
                if (!is_content){
                    // content starts
                    if (c === '{'){
                        is_content = true
                        line = '<span class="css-tag">' + line + '</span><span class="css-brace">{</span>'
                    }
                    else {
                        line += c
                    }
                }
                else{
                    // content ends
                    if (c === '}'){
                        is_content = false
                        line = line + '<span class="css-brace">}</span>'
                    }
                    else if (c === ':'){
                        line = '<span class="css-attr">' + line + ':</span>'
                    }
                    else {
                        line += c
                    }
                }
            }
        }
        return html
    }
    // Load from files
    function loadHTMLandCSS(){
        $.get(code_path + '/xml.css', function(data){
            data_css = data
            $('#CSS').html(renderCSS(data_css))
        })
        $.get(code_path + '/xml.html', function(data){
            data_html = data
            $('#HTML').html(renderHTML(data_html))
        })
        $('.page-viewer').attr('src', code_path + '/xml.html')
    }
    loadHTMLandCSS()

    /*********************
     *** Code Viewer Panel ***
     *********************/
    // HTML/CSS Tab Switch Buttons
    $('.code-viewer-btn').on('click', function () {
        let language = this.text;

        if(language !== $('.code-viewer:visible').attr('id')){
            $('.code-viewer-btn').removeClass('active-btn')
            $(this).addClass('active-btn');

            $('.code-viewer').fadeOut(100).promise().done(function () {
                $('#' + language).fadeIn(100);
            });
        }
    })

    /*********************
     *** Code Edition ***
     *********************/
    // Edit code
    $('.btn-edit').on('click', function () {
        if (! $(this).hasClass('active-btn')){
            $('.code-viewer').attr('contenteditable', true)
            $('.btn-edit').addClass('active-btn')
            $('.btn-edit').attr('title', 'Click again to exit editing')
            $('#btn-run').toggle('slide')
            $('#btn-reload').toggle('slide')
        }
        else {
            $('.code-viewer').attr('contenteditable', false)
            $('.btn-edit').removeClass('active-btn')
            $('.btn-edit').attr('title', 'Edit the Code')
            $('#btn-run').toggle('slide')
            $('#btn-reload').toggle('slide')
        }
    })
    $('.code-viewer').on('input', function () {
        console.log('aaaaa')
    })

    // Run the new code
    $('#btn-run').on('click', function () {
        data_html = $('#HTML').text()
        data_css = $('#CSS').text()

        // Embed the new css into html <style>
        let iframe = data_html.replace('REPLACEME', '\n' + data_css + '\n')
        $('.page-viewer').attr('srcdoc', iframe)
    })

    // Reload code
    $('#btn-reload').on('click', function () {
        loadHTMLandCSS()
    })
})