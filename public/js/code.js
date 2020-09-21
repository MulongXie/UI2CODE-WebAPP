$(document).ready(function () {

    // var code_path = $('#code-path').attr('data-value')
    var code_path = 'generated-code'
    var data_html = ''
    var data_css = ''

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

        zip.file('xml.html', data_html)
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
    function renderHTML(line) {
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
    $.get(code_path + '/xml.html', function(data){
        data_html = data
        let gen_html_lines = data.split('\n');
        let html_text = ''
        for(let i = 0; i < gen_html_lines.length; i ++){
            let line = gen_html_lines[i]
            html_text += '<pre>' + renderHTML(line) + '</pre>'
        }
        $('#HTML').html(html_text)
    })

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
    $.get(code_path + '/xml.css', function(data){
        data_css = data
        let css_text = renderCSS(data)
        $('#CSS').html(css_text)
    })


    /*********************
     *** Tab Switch Buttons ***
     *********************/
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
})