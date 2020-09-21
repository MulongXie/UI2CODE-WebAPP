$(document).ready(function () {
    var code_path = $('#code-path').attr('data-value')
    $.get('generated-code/xml.html', function(data){
        let gen_html_lines = data.split('\n');
        let html_text = ''
        for(let i = 0; i < gen_html_lines.length; i ++){
            let line = gen_html_lines[i]
            console.log((line))
            html_text += '<pre>' + highlighterHTML(line) + '</pre>'
        }
        $('#code-html').html(html_text)
    })

    function highlighterHTML(line) {
        let html = ''

        let tag = ''
        let search_tag = false
        let quotation = ''
        let search_quotation = false
        let content = ''

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

})