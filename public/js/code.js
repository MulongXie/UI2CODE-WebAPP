$(document).ready(function () {
    var code_path = $('#code-path').attr('data-value')
    $.get('generated-code/xml.html', function(data){
        let gen_html_lines = data.split('\n');
        let html_text = ''
        for(let i = 0; i < gen_html_lines.length; i ++){
            let line = gen_html_lines[i]
            html_text += '<pre>' + highlighterHTML(line) + '</pre>'
        }
        $('#code-html').html(html_text)
    })

    function highlighterHTML(line) {
        let html = ''
        let content = ''
        for(let i = 0; i < line.length; i++){
            if(line[i] == '<'){
                if(content != ''){
                    html += '<span>' + content + '</span>'
                    content = ''
                }
                html += '<span class="bracket">' + line[i] + '</span>'
            }
            else if(line[i] == '>'){
                html += '<span>' + content + '</span>'
                html += '<span class="bracket">' + line[i] + '</span>'
                content = ''
            }
            else {
                content += line[i]
            }
        }
        return html
    }

})