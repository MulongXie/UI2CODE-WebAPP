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
        let css = ''
        for(let i = 0; i < line.length; i++){

        }
        return line
    }
    $.get(code_path + '/xml.css', function(data){
        let gen_css_lines = data.split('\n');
        let css_text = ''
        for(let i = 0; i < gen_css_lines.length; i ++){
            let line = gen_css_lines[i]
            css_text += '<pre>' + renderCSS(line) + '</pre>'
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