function highlighterHTML(line) {
    let html = ''

    let tag = ''
    let search_tag = false
    let content = ''

    for(let i = 0; i < line.length; i++){
        let c = line[i]

        if(search_tag){
            if(c === ' ' || c === '>'){
                html += '<span class="html-tag">' + tag + c + '</span>\n'
                tag = ''
                search_tag = false
            }
            else {
                tag += c
            }
        }
        else if(c === '<'){
            if(content !== ''){
                html += '<span>' + content + '</span>\n'
                content = ''
            }
            html += '<span class="html-bracket">' + line[i] + '</span>\n'
            search_tag = true
        }
        else if(c === '>'){
            html += '<span>' + content + '</span>\n'
            html += '<span class="html-bracket">' + line[i] + '</span>\n'
            content = ''
        }
        else {
            content += line[i]
        }
    }
    return html
}

let l = '<li class="li-7">'

console.log(highlighterHTML(l))