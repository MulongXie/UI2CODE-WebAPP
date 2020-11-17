var data_html = ''  // html of subpage in iframe
var data_css = ''   // css of subpage in iframe
var data_react_index = ''
var data_react_blks =''

$(document).ready(function () {

    var code_path = $('#code-path').attr('data-value')
    // var code_path = 'generated-code'
    console.log('path:', code_path)


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
        let page = zip.folder('page')
        page.file('xml.html', export_html)
        page.file('xml.css', data_css)
        let react = zip.folder('react')
        react.file('index.js', data_react_index)
        react.file('blocks.js', data_react_blks)
        zip.generateAsync({type:"blob"}, function () {
        }).then(function(content) {
            // see FileSaver.js
            saveAs(content, "code.zip");
        });
    })

    /*********************
    *** Coder Rendering on the Right CodeViewer***
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
        let marked_data = ''  // original html data with element number mark
        let gen_html_lines = data.split('\n');
        let html = ''

        let ele_num = 0
        for(let i = 0; i < gen_html_lines.length; i ++){
            let line = gen_html_lines[i]
            // ignore outside stylesheet
            if (line.includes('link') || line.includes('REPLACEME')){
                let spans = '<span class="html-bracket">\t<</span>' +
                    '<span class="html-tag">style</span>' +
                    '<span class="html-bracket">></span>' +
                    'REPLACEME' +
                    '<span class="html-bracket"><</span>' +
                    '<span class="html-tag">/style</span>' +
                    '<span class="html-bracket">></span>'

                html += '<pre style="display: none" class="line-wrapper">' + spans + '</pre>'
                line = '<style>REPLACEME</style>'
            }
            else {
                // mark the beginning of an element
                if (line.includes('<') && ! line.includes('</')){
                    html += '<pre class="line-wrapper html-start" id="ele-' + ele_num.toString() +'">' + renderHTMLLine(line) + '</pre>'
                    line = line.replace('>', ' ele-num="' + ele_num.toString() + '">')
                    ele_num += 1
                }
                else {
                    html += '<pre class="line-wrapper">' + renderHTMLLine(line) + '</pre>'
                }
            }
            marked_data += line + '\n'
        }
        // renew data_html with element number
        data_html = marked_data
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
                html += '<pre class="line-wrapper">' + line + '</pre>'
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
        data_css = data
        return html
    }
    // Load from files
    function loadHTMLandCSS(){
        $.get(code_path + '/xml.css', function(data){
            $('#CSS').html(renderCSS(data))
        })
        $.get(code_path + '/xml.html', function(data){
            $('#HTML').html(renderHTML(data))
        })
        $.get(code_path + '/react/index.txt', function (data) {
            data_react_index = data
            $('#React-index code').html(hljs.highlightAuto(data).value)
        })
        $.get(code_path + '/react/blocks.txt', function (data) {
            data_react_blks = data
            $('#React-blocks code').html(hljs.highlightAuto(data).value)
        })
        // $('.page-viewer').attr('src', code_path + '/xml.html')
    }
    loadHTMLandCSS()


    /*********************
     *** Code Viewer Panel ***
     *********************/
    // HTML/CSS/React Tab Switch Buttons
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
    // control input in contenteditable
    // $('.code-viewer').on('input', function () {
    //     let code_lines = $('#HTML').children()
    //     let new_code = ''
    //     console.log(code_lines)
    //     for (let i = 0; i < code_lines.length; i ++){
    //         new_code += $(code_lines[i]).text() + '\n'
    //     }
    //     console.log(new_code)
    //     $('#HTML').html(renderHTML(new_code))
    // })
    // preview imag modal
    $('.preview-img').on('click', function () {
        console.log($(this).attr('src'))
        $('#preview-img-full').attr('src', $(this).attr('src'))
    })
    $('#react-file-select').on('change', function () {
        console.log()
        let file = $('#react-file-select option:selected').val()
        $('.wrapper-react').fadeOut(100).promise().done(function () {
            $('#React-' + file).fadeIn(100);
        });
    })


    /*********************
     *** Code Edition ***
     *********************/
    function endEditing() {
        $('.code-viewer').attr('contenteditable', false)
        $('.btn-edit').removeClass('active-btn')
        $('.btn-edit').attr('title', 'Edit the Code')
        $('#btn-run').toggle('slide')
        $('#btn-reload').toggle('slide')
        $('#btn-close-edit').toggle('slide')
    }
    $('#btn-close-edit').on('click', function () {
        endEditing()
    })
    // Edit code
    $('.btn-edit').on('click', function () {
        if (! $(this).hasClass('active-btn')){
            $('.code-viewer').attr('contenteditable', true)
            $('.btn-edit').addClass('active-btn')
            $('.btn-edit').attr('title', 'Click again to exit editing')
            $('#btn-run').toggle('slide')
            $('#btn-reload').toggle('slide')
            $('#btn-close-edit').toggle('slide')
        }
        else {
            endEditing()
        }
        // end element tracing if it's open
        if ($('#btn-close-trace').is(':visible')){
            endTracing()
        }
    })
    // Run the new code
    $('#btn-run').on('click', function () {
        let HTML = $('#HTML')
        let CSS = $('#CSS')
        // init HTML code viewer
        let code_lines = HTML.children()
        let new_code = ''
        for (let i = 0; i < code_lines.length; i ++){
            new_code += $(code_lines[i]).text() + '\n'
        }
        HTML.html(renderHTML(new_code))
        // init CSS code viewer
        code_lines = CSS.children()
        new_code = ''
        for (let i = 0; i < code_lines.length; i ++){
            new_code += $(code_lines[i]).text() + '\n'
        }
        CSS.html(renderCSS(new_code))

        initIframe()
        initCodeViewer()
    })
    // Reload code
    $('#btn-reload').on('click', function () {
        loadHTMLandCSS()
    })


    /*********************
     *** Iframe Element Tracing ***
     *********************/
    function markElement(event){
        let page = document.getElementsByTagName('iframe')[0].contentWindow.document
        // highlight corresponding iframe element
        let eles = page.querySelectorAll('.ele-active')
        for (let i = 0; i < eles.length; i ++){
            eles[i].classList.remove('ele-active')
        }
        let ele = event.target
        ele.classList.add("ele-active")
        last_ele = ele

        // scroll the codeViewer to the corresponding code
        let code_wrapper = $('.code-viewer')
        let code_line = $('#ele-' + ele.getAttribute('ele-num'))
        let code_offset = code_line.offset().top - code_wrapper.offset().top + code_wrapper.scrollTop()
        $('.active-code-line').removeClass('active-code-line')
        code_line.addClass('active-code-line')
        code_wrapper.animate({
            scrollTop : code_offset
        })
    }
    function endTracing() {
        $('.btn-ele-trace').removeClass('active')
        $('#trace-info').slideUp(200)
        $('.page-viewer').css('height', '100%')
        $('#btn-close-trace').toggle('slide')
        $('.active-code-line').removeClass('active-code-line')

        if (last_ele !== '') {last_ele.classList.remove("ele-active")}
        // remove event listener
        let page = document.getElementsByTagName('iframe')[0].contentWindow.document
        page.getElementsByTagName('body')[0].removeEventListener('click', markElement)
    }
    let last_ele = "" // the last clicked element in the iframe
    // Start tracing by inserting css and js into iframe
    $('.btn-ele-trace').on('click', function () {
        $('.btn-ele-trace').addClass('active')
        // display close button and trace info
        if ($('#btn-close-trace').is(":hidden")){
            $('#btn-close-trace').toggle('slide')
            $('#trace-info').slideDown(200)
            $('.page-viewer').css('height', 'calc(100% - 20px)')
        }
        // Close code editing if it's on
        if ($('.btn-edit').hasClass('active-btn')){
            endEditing()
        }

        // access element in iframe
        let page = document.getElementsByTagName('iframe')[0].contentWindow.document
        page.getElementsByTagName('body')[0].addEventListener('click', markElement)
    })
    // close tracing button
    $('#btn-close-trace').on('click', function () {
        endTracing()
    })


    /*********************
     *** Wrapper ***
     *********************/
    $(function () {
        $('.tree li:has(ul)').addClass('parent_li').find(' > span').attr('title', 'Collapse this branch');
        $('.tree li.parent_li > span').on('click', function (e) {
            var children = $(this).parent('li.parent_li').find(' > ul > li');
            if (children.is(":visible")) {
                children.hide('fast');
                $(this).attr('title', 'Expand this branch').find(' > i').addClass('icon-plus-sign').removeClass('icon-minus-sign');
            } else {
                children.show('fast');
                $(this).attr('title', 'Collapse this branch').find(' > i').addClass('icon-minus-sign').removeClass('icon-plus-sign');
            }
            e.stopPropagation();
        });
    });
    $('.btn-sidebar').on('click', function () {
        if (!$(this).hasClass('btn-sidebar-active')){
            $('.btn-sidebar-active').removeClass('btn-sidebar-active')
            $(this).addClass('btn-sidebar-active')
            $('.wrapper-active').removeClass('wrapper-active')
            $('.' + $(this).attr('data-target')).addClass('wrapper-active')
        }
    })
})

// Render the iframe page
function initIframe(css='', js=''){
    // Add element class
    css += '.ele-active{\n' +
        '   background: red !important;\n' +
        '   opacity: 1;\n' +
        '   transition: 1s\n' +
        '}\n' +
        'html{\n' +
        '   scroll-behavior: smooth;\n' +
        '}\n'
    let code_css = data_css + css
    // Add js
    /*
        js += '<script>\n' +
            '    window.onload = function () {\n' +
            '        var pre_ele = ""\n' +
            '        document.getElementsByTagName(\'body\')[0].onclick = function (event) {\n ' +
            '            if (pre_ele !== ""){\n' +
            '                pre_ele.classList.remove("ele-active")\n' +
            '            }\n' +
            '            var ele = event.target\n' +
            '            ele.classList.add("ele-active")\n' +
            '            pre_ele = ele\n'  +
            '            console.log(ele)' +
            '        }\n' +
            '    }\n' +
        */
    let code_html = data_html.replace('</body>', js + '</body>')
    // Embed the new css into html <style>
    let iframe = code_html.replace('REPLACEME', '\n' + code_css + '\n')
    $('.page-viewer').attr('srcdoc', iframe)
}

function initCodeViewer() {
    // Jump to page element in Iframe by clicking code line in CodeViewer
    $('.html-start').on('click', function (event) {
        // highlight clicked line
        $('.active-code-line').removeClass('active-code-line')
        $(this).addClass('active-code-line')

        let target = event.target
        if (target.tagName === 'SPAN'){
            target = target.parentNode
        }
        console.log(target)
        let ele_num = target.id.split('-')[1]
        console.log(ele_num)
        if (ele_num === undefined){return}

        // access iframe page
        let page = document.getElementsByTagName('iframe')[0].contentWindow
        let element = page.document.body.querySelectorAll('[ele-num="'+ ele_num.toString() +'"]')[0]
        console.log(element)
        if (element === undefined){return}
        // scroll iframe page to the selected element
        page.scrollTo(0, element.offsetTop)
        // highlight corresponding iframe element
        let eles = page.document.querySelectorAll('.ele-active')
        for (let i = 0; i < eles.length; i ++){
            eles[i].classList.remove('ele-active')
        }
        element.classList.add('ele-active')
    })
}