$(document).ready(function () {
    /*********************
    *** Coder Rendering ***
     *********************/
    // var code_path = $('#code-path').attr('data-value')
    var code_path = 'generated-code'
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
        let gen_html_lines = data.split('\n');
        let html_text = ''
        for(let i = 0; i < gen_html_lines.length; i ++){
            let line = gen_html_lines[i]
            html_text += '<pre>' + renderHTML(line) + '</pre>'
        }
        $('#HTML').html(html_text)
    })

    // CSS
    function renderCSS(line){
        let html  = ''

        let tag = ''
        let content = ''
        let search_content = false

        for(let i = 0; i < line.length; i++){
            let c = line[i]

            if (!search_content){
                // content starts
                if (c === '{'){
                    search_content = true
                    html += '<span class="css-tag">' + tag + '</span>'
                    tag = ''
                }
                else {
                    tag += c
                }
            }
            else{
                // content ends
                if (c === '}'){
                    search_content = false
                    html += '<span class="css-content">' + content + '</span>'
                    content = ''
                }
                else {
                    content += c
                }
            }
        }
        return html
    }
    $.get(code_path + '/xml.css', function(data){
        let css_text = ''

        let line = ''
        let is_content = false

        for(let i = 0; i < data.length; i ++){
            let c = data[i]

            if (c === '\n'){
                if (is_content){
                    line = '<span class="css-content">' + line + '</span>'
                }
                css_text += '<pre>' + line + '</pre>'
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