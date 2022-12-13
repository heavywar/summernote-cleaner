/* https://github.com/DiemenDesign/summernote-cleaner */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('jquery'));
    } else {
        factory(window.jQuery);
    }
}
(function ($) {
//   $.extend(true, $.summernote.lang, {
//     // 'en-US': {
//     //   cleaner: {
//     //     tooltip: 'Clear  html',
//     //     not: 'Text has been Cleaned!!!',
//     //     notEmptySelect: 'Highlight the text you want to сlear tags',
//     //     limitText: 'Total characters:\n',
//     //     limitHTML: 'HTML'
//     //   }
//     // },
//     // 'ru_RU': {
//     //   cleaner: {
//     //     tooltip: 'Remove html tags',
//     //     not: 'Text has been Cleaned!!!',
//     //     notEmptySelect: 'Выделите текст, который хотите очистить от тегов html',
//     //     limitText: 'Всего символов',
//     //     limitHTML: 'HTML'
//     //   }
//     // }
//
//   });

    $.extend($.summernote.options, {
        cleaner: {
            action: 'both', // both|button|paste 'button' only cleans via toolbar button, 'paste' only clean when pasting content, both does both options.
            newline: '<br>', // Summernote's default is to use '<p><br></p>'
            notStyle: 'position:absolute;top:0;left:0;right:0',
            icon: '<i class="note-icon"><svg xmlns="http://www.w3.org/2000/svg" id="libre-paintbrush" viewBox="0 0 14 14" width="14" height="14"><path d="m 11.821425,1 q 0.46875,0 0.82031,0.311384 0.35157,0.311384 0.35157,0.780134 0,0.421875 -0.30134,1.01116 -2.22322,4.212054 -3.11384,5.035715 -0.64956,0.609375 -1.45982,0.609375 -0.84375,0 -1.44978,-0.61942 -0.60603,-0.61942 -0.60603,-1.469866 0,-0.857143 0.61608,-1.419643 l 4.27232,-3.877232 Q 11.345985,1 11.821425,1 z m -6.08705,6.924107 q 0.26116,0.508928 0.71317,0.870536 0.45201,0.361607 1.00781,0.508928 l 0.007,0.475447 q 0.0268,1.426339 -0.86719,2.32366 Q 5.700895,13 4.261155,13 q -0.82366,0 -1.45982,-0.311384 -0.63616,-0.311384 -1.0212,-0.853795 -0.38505,-0.54241 -0.57924,-1.225446 -0.1942,-0.683036 -0.1942,-1.473214 0.0469,0.03348 0.27455,0.200893 0.22768,0.16741 0.41518,0.29799 0.1875,0.130581 0.39509,0.24442 0.20759,0.113839 0.30804,0.113839 0.27455,0 0.3683,-0.247767 0.16741,-0.441965 0.38505,-0.753349 0.21763,-0.311383 0.4654,-0.508928 0.24776,-0.197545 0.58928,-0.31808 0.34152,-0.120536 0.68974,-0.170759 0.34821,-0.05022 0.83705,-0.07031 z"/></svg></i>',
            keepHtml: true, //Remove all Html formats
            keepOnlyTags: [], // If keepHtml is true, remove all tags except these
            keepClasses: false, //Remove Classes
            badTags: ['style', 'script', 'applet', 'embed', 'noframes', 'noscript', 'html'], //Remove full tags with contents
            badAttributes: ['style', 'start'], //Remove attributes from remaining tags
            limitChars: 0, // 0|# 0 disables option
            limitDisplay: 'both', // none|text|html|both
            limitStop: false // true/false
        }
    });
    $.extend($.summernote.plugins, {
        'cleaner': function (context) {
            var self = this,
                ui = $.summernote.ui,
                $note = context.layoutInfo.note,
                $editor = context.layoutInfo.editor,
                options = context.options,
                lang = options.langInfo;
            var cleanText = function (txt, nlO) {
                var out = txt;
                if (!options.cleaner.keepClasses) {
                    var sS = /(\n|\r| class=(")?Mso[a-zA-Z]+(")?)/g;
                    out = txt.replace(sS, ' ');
                }
                var nL = /(\n)+/g;
                out = out.replace(nL, nlO);
                if (options.cleaner.keepHtml) {
                    var cS = new RegExp('<!--(.*?)-->', 'gi');
                    out = out.replace(cS, '');
                    var tS = new RegExp('<(/)*(meta|link|\\?xml:|st1:|o:|font)(.*?)>', 'gi');
                    out = out.replace(tS, '');
                    var bT = options.cleaner.badTags;
                    for (var i = 0; i < bT.length; i++) {
                        tS = new RegExp('<' + bT[i] + '\\b.*>.*</' + bT[i] + '>', 'gi');
                        out = out.replace(tS, '');
                    }
                    var allowedTags = options.cleaner.keepOnlyTags;
                    if (typeof(allowedTags) == "undefined") allowedTags = [];
                    if (allowedTags.length > 0) {
                        allowedTags = (((allowedTags||'') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('');
                        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
                        out = out.replace(tags, function($0, $1) {
                            return allowedTags.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
                        });
                    }
                    var bA = options.cleaner.badAttributes;
                    for (var ii = 0; ii < bA.length; ii++ ) {
                        //var aS=new RegExp(' ('+bA[ii]+'="(.*?)")|('+bA[ii]+'=\'(.*?)\')', 'gi');
                        var aS = new RegExp(' ' + bA[ii] + '=[\'|"](.*?)[\'|"]', 'gi');
                        out = out.replace(aS, '');
                        aS = new RegExp(' ' + bA[ii] + '[=0-9a-z]', 'gi');
                        out = out.replace(aS, '');
                    }
                }
                return out;
            };
            if (options.cleaner.action == 'both' || options.cleaner.action == 'button') {
                context.memo('button.cleaner', function () {
                    var button = ui.button({
                        contents: options.cleaner.icon,
                        tooltip: lang.cleaner.tooltip,
                        container: 'body',
                        click: function () {
                            if($note.summernote('createRange').toString().length===0 &&   $editor.find('.note-status-output').length > 0){
                                $(".alertSelectHtml").remove();
                                $editor.find('.note-status-output').before('<div style="padding: 7px 10px 7px 10px; font-size: 13px;margin-bottom: 0;" class="alert alert-warning alert-dismissible fade show alertSelectHtml">' +
                                    ' <button type="button" class="close" data-bs-dismiss="alert" aria-label="Close">\n' +
                                    '    <span style="\n' +
                                    '    position: relative;\n' +
                                    '   \n' +
                                    '    \n" aria-hidden="true">&times;</span>\n' +
                                    '  </button>' + lang.cleaner.notEmptySelect + '</div>');

                            }
                            else {
                                $(".alertSelectHtml").remove();
                                $editor.find('.note-status-output').before('<div style="padding: 7px 10px 7px 10px; font-size: 13px;margin-bottom: 0;" class="alert alert-warning alert-dismissible fade show alertSelectHtml">' +
                                    ' <button type="button" class="close" data-bs-dismiss="alert" aria-label="Close">\n' +
                                    '    <span style="\n' +
                                    '    position: relative;\n' +
                                    '   \n' +
                                    '    \n" aria-hidden="true">&times;</span>\n' +
                                    '  </button>' + lang.cleaner.isCleaned + '</div>');


                            }
                            if ($note.summernote('createRange').toString())
                                $note.summernote('pasteHTML', $note.summernote('createRange').toString());
                            else
                                $note.summernote('code', cleanText($note.summernote('code')));
                            //Добавляет alrt после отчистки
                        //       if ($editor.find('.note-status-output').length > 0)
                        //         $editor.find('.note-status-output').html('<div class="alert alert-success">' + lang.cleaner.isCleaned + '</div>');
                        }
                    });
                    return button.render();
                });
            }
            this.events = {
                'summernote.init': function () {
                    if ($.summernote.interface === 'lite') {
                        $("head").append('<style>.note-statusbar .pull-right{float:right!important}.note-status-output .text-muted{color:#777}.note-status-output .text-primary{color:#286090}.note-status-output .text-success{color:#3c763d}.note-status-output .text-info{color:#31708f}.note-status-output .text-warning{color:#8a6d3b}.note-status-output .text-danger{color:#a94442}.alert{margin:-7px 0 0 0;padding:7px 10px;border:1px solid transparent;border-radius:0}.alert .note-icon{margin-right:5px}.alert-success{color:#3c763d!important;background-color: #dff0d8 !important;border-color:#d6e9c6}.alert-info{color:#31708f;background-color:#d9edf7;border-color:#bce8f1}.alert-warning{color:#8a6d3b;background-color:#fcf8e3;border-color:#faebcc}.alert-danger{color:#a94442;background-color:#f2dede;border-color:#ebccd1}</style>');
                    }
                    if (options.cleaner.limitChars != 0 || options.cleaner.limitDisplay != 'none') {
                        var textLength = 0;

                        var lengthStatus = '';
                        if (textLength.length > options.cleaner.limitChars && options.cleaner.limitChars > 0)
                            lengthStatus += 'text-danger">';
                        else
                            lengthStatus += '">';
                        if (options.cleaner.limitDisplay == 'text' || options.cleaner.limitDisplay == 'both')
                            lengthStatus += lang.cleaner.limitText + ': ' + "-";

                        // if (options.cleaner.limitDisplay == 'html' || options.cleaner.limitDisplay == 'both') lengthStatus += lang.cleaner.limitHTML + ': ' + codeLength.length;
                        $editor.find('.note-status-output-countCharacters').html('<small class="pull-right ' + lengthStatus + '&nbsp;</small>');
                    }
                },
                'summernote.keydown': function (we, e) {
                    if (options.cleaner.limitChars != 0 || options.cleaner.limitDisplay != 'none') {
                        var textLength =  $editor.find(".note-editable").text().replace(/(<([^>]+)>)/ig, "").replace(/( )/, " ");
                        var codeLength =  $editor.find('.note-editable').html();
                        var lengthStatus = '';
                        if (options.cleaner.limitStop == true && textLength.length >= options.cleaner.limitChars) {
                            var key = e.keyCode;
                            allowed_keys = [8, 37, 38, 39, 40, 46]
                            if ($.inArray(key, allowed_keys) != -1) {
                                $editor.find('.cleanerLimit').removeClass('text-danger');
                                return true;
                            } else {
                                $editor.find('.cleanerLimit').addClass('text-danger');
                                e.preventDefault();
                                e.stopPropagation();
                            }
                        } else {
                            if (textLength.length > options.cleaner.limitChars && options.cleaner.limitChars > 0)
                                lengthStatus += 'text-danger">';
                            else
                                lengthStatus += '">';
                            if (options.cleaner.limitDisplay == 'text' || options.cleaner.limitDisplay == 'both')
                                lengthStatus += lang.cleaner.limitText + ': ' + textLength.length;

                            // if (options.cleaner.limitDisplay == 'html' || options.cleaner.limitDisplay == 'both')
                            //   lengthStatus +=  codeLength.length;
                            $editor.find('.note-status-output-countCharacters').html('<small class="cleanerLimit pull-right ' + lengthStatus + '&nbsp;</small>');
                        }
                    }
                },
                'summernote.paste':function (we, e) {
                    if (options.cleaner.action == 'both' || options.cleaner.action == 'paste') {
                        e.preventDefault();
                        var ua = window.navigator.userAgent;
                        var msie = ua.indexOf("MSIE ");
                        msie = msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./);
                        var ffox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                        if (msie)
                            var text = window.clipboardData.getData("Text");
                        else {
                            var clipboardData = e.originalEvent.clipboardData.getData('text/html');
                            var text = e.originalEvent.clipboardData.getData(clipboardData ? 'text/html' : 'text/plain');
                        }
                        if (text) {
                            if (msie || ffox)
                                setTimeout(function(){
                                    document.execCommand('insertHtml', false, cleanText(text, options.cleaner.newline));}, 1);
                            else
                                // $note.summernote('insertHtml', cleanText(text, options.cleaner.newline));
                                document.execCommand('insertHtml', false, cleanText(text, options.cleaner.newline));

                        }
                        // if (text) {
                        //   if (msie || ffox) {
                        //     setTimeout(function () {
                        //       $note.summernote('code', cleanPaste(text));
                        //     }, 1);
                        //   } else {
                        //     $note.summernote('code', cleanPaste(text));
                        //   }
                        //
                        //   if ($editor.find('.note-status-output').length > 0) {
                        //     $editor.find('.note-status-output').html(lang.cleaner.not);
                        //   }
                        // }
                    }
                }
            }
        }
    });
}));

/**
 * @property browser
 * @description Standard browser detection
 * @type Object
 */
function browser() {
    var br = navigator.userAgent;
    //Check for webkit3
    if (br.webkit >= 420) {
        br = 'webkit';
    } else {
        br = 'webkit3';
    }
    if (navigator.userAgent.indexOf('Macintosh') !== -1) {
        br = 'mac';
    }
    return br;
}

function cleanPaste(html) {
    // Run the standard YUI cleanHTML method
    html = _cleanIncomingHTML(html);
    html = cleanHTML(html);
    html = html.replace(/<(\/)*(\\?xml:|meta|link|span|font|del|ins|st1:|[ovwxp]:)((.|\s)*?)>/gi, ''); // Unwanted tags
    html = html.replace(/(class|style|type|start)=("(.*?)"|(\w*))/gi, ''); // Unwanted sttributes
    html = html.replace(/<style(.*?)style>/gi, '');   // Style tags
    html = html.replace(/<script(.*?)script>/gi, ''); // Script tags
    html = html.replace(/<!--(.*?)-->/gi, '');        // HTML comments
    html = html.replace(/<o:p>\s*<\/o:p>/g, "") ;
    html = html.replace(/<o:p>.*?<\/o:p>/g, "&nbsp;") ;
    html = html.replace( /\s*mso-[^:]+:[^;"]+;?/gi, "" ) ;
    html = html.replace( /\s*MARGIN: 0cm 0cm 0pt\s*;/gi, "" ) ;
    html = html.replace( /\s*MARGIN: 0cm 0cm 0pt\s*"/gi, "\"" ) ;
    html = html.replace( /\s*TEXT-INDENT: 0cm\s*;/gi, "" ) ;
    html = html.replace( /\s*TEXT-INDENT: 0cm\s*"/gi, "\"" ) ;
    html = html.replace( /\s*TEXT-ALIGN: [^\s;]+;?"/gi, "\"" ) ;
    html = html.replace( /\s*PAGE-BREAK-BEFORE: [^\s;]+;?"/gi, "\"" ) ;
    html = html.replace( /\s*FONT-VARIANT: [^\s;]+;?"/gi, "\"" ) ;
    html = html.replace( /\s*tab-stops:[^;"]*;?/gi, "" ) ;
    html = html.replace( /\s*tab-stops:[^"]*/gi, "" ) ;
    html = html.replace( /\s*face="[^"]*"/gi, "" ) ;
    html = html.replace( /\s*face=[^ >]*/gi, "" ) ;
    html = html.replace( /\s*FONT-FAMILY:[^;"]*;?/gi, "" ) ;
    html = html.replace(/<(\w[^>]*) class=([^ |>]*)([^>]*)/gi, "<$1$3") ;
    html = html.replace( /<(\w[^>]*) style="([^\"]*)"([^>]*)/gi, "<$1$3" ) ;
    html = html.replace( /\s*style="\s*"/gi, '' ) ;
    html = html.replace( /<SPAN\s*[^>]*>\s*&nbsp;\s*<\/SPAN>/gi, '&nbsp;' ) ;
    html = html.replace( /<SPAN\s*[^>]*><\/SPAN>/gi, '' ) ;
    html = html.replace(/<(\w[^>]*) lang=([^ |>]*)([^>]*)/gi, "<$1$3") ;
    html = html.replace( /<SPAN\s*>(.*?)<\/SPAN>/gi, '$1' ) ;
    html = html.replace( /<FONT\s*>(.*?)<\/FONT>/gi, '$1' ) ;
    html = html.replace(/<\\?\?xml[^>]*>/gi, "") ;
    html = html.replace(/<\/?\w+:[^>]*>/gi, "") ;
    html = html.replace( /<H\d>\s*<\/H\d>/gi, '' ) ;
    html = html.replace( /<H1([^>]*)>/gi, '' ) ;
    html = html.replace( /<H2([^>]*)>/gi, '' ) ;
    html = html.replace( /<H3([^>]*)>/gi, '' ) ;
    html = html.replace( /<H4([^>]*)>/gi, '' ) ;
    html = html.replace( /<H5([^>]*)>/gi, '' ) ;
    html = html.replace( /<H6([^>]*)>/gi, '' ) ;
    html = html.replace( /<\/H\d>/gi, '<br>' ) ; //remove this to take out breaks where Heading tags were
    html = html.replace( /<(U|I|STRIKE)>&nbsp;<\/\1>/g, '&nbsp;' ) ;
    html = html.replace( /<(B|b)>&nbsp;<\/\b|B>/g, '' ) ;
    html = html.replace( /<([^\s>]+)[^>]*>\s*<\/\1>/g, '' ) ;
    html = html.replace( /<([^\s>]+)[^>]*>\s*<\/\1>/g, '' ) ;
    html = html.replace( /<([^\s>]+)[^>]*>\s*<\/\1>/g, '' ) ;
    //some RegEx code for the picky browsers
    var re = new RegExp("(<P)([^>]*>.*?)(<\/P>)","gi") ;
    html = html.replace( re, "<div$2</div>" ) ;
    var re2 = new RegExp("(<font|<FONT)([^*>]*>.*?)(<\/FONT>|<\/font>)","gi") ;
    html = html.replace( re2, "<div$2</div>") ;
    html = html.replace( /size|SIZE = ([\d]{1})/g, '' ) ;
    return html;
}

/**
 * @method _cleanIncomingHTML Taken and modified from YUI
 * @param {String} html The unfiltered HTML
 * @description Process the HTML with a few regexes to clean it up and stabilize the input
 * @return {String} The filtered HTML
 */
function _cleanIncomingHTML(html) {
    html = html.replace(/<strong([^>]*)>/gi, '<b$1>');
    html = html.replace(/<\/strong>/gi, '</b>');
    //replace embed before em check
    html = html.replace(/<embed([^>]*)>/gi, '<NOTE_EMBED$1>');
    html = html.replace(/<\/embed>/gi, '</NOTE_EMBED>');
    html = html.replace(/<em([^>]*)>/gi, '<i$1>');
    html = html.replace(/<\/em>/gi, '</i>');
    //Put embed tags back in..
    html = html.replace(/<NOTE_EMBED([^>]*)>/gi, '<embed$1>');
    html = html.replace(/<\/NOTE_EMBED>/gi, '</embed>');
    //if (this.get('plainText')) {
    html = html.replace(/\n/g, '<br>').replace(/\r/g, '<br>');
    html = html.replace(/  /gi, '&nbsp;&nbsp;'); //Replace all double spaces
    html = html.replace(/\t/gi, '&nbsp;&nbsp;&nbsp;&nbsp;'); //Replace all tabs
    //}
    //Removing Script Tags from the Editor
    html = html.replace(/<script([^>]*)>/gi, '<bad>');
    html = html.replace(/<\/script([^>]*)>/gi, '</bad>');
    html = html.replace(/&lt;script([^>]*)&gt;/gi, '<bad>');
    html = html.replace(/&lt;\/script([^>]*)&gt;/gi, '</bad>');
    //Replace the line feeds
    html = html.replace(/\n/g, '<NOTE_LF>').replace(/\r/g, '<NOTE_LF>');
    //Remove Bad HTML elements (used to be script nodes)
    html = html.replace(new RegExp('<bad([^>]*)>(.*?)<\/bad>', 'gi'), '');
    //Replace the lines feeds
    html = html.replace(/<NOTE_LF>/g, '\n');
    return html;
}

/**
 * @method cleanHTML Taken and modified from YUI
 * @param {String} html The unfiltered HTML
 * @description Process the HTML with a few regexes to clean it up and stabilize the output
 * @return {String} The filtered HTML
 */
function cleanHTML(html) {
//Start Filtering Output
//Begin RegExs..
    var markup = html;
//Make some backups...
    html = this.pre_filter_linebreaks(html, markup);
    html = html.replace(/<img([^>]*)\/>/gi, '<NOTE_IMG$1>');
    html = html.replace(/<img([^>]*)>/gi, '<NOTE_IMG$1>');
    html = html.replace(/<input([^>]*)\/>/gi, '<NOTE_INPUT$1>');
    html = html.replace(/<input([^>]*)>/gi, '<NOTE_INPUT$1>');
    html = html.replace(/<ul([^>]*)>/gi, '<NOTE_UL$1>');
    html = html.replace(/<\/ul>/gi, '<\/NOTE_UL>');
    html = html.replace(/<blockquote([^>]*)>/gi, '<NOTE_BQ$1>');
    html = html.replace(/<\/blockquote>/gi, '<\/NOTE_BQ>');
    html = html.replace(/<embed([^>]*)>/gi, '<NOTE_EMBED$1>');
    html = html.replace(/<\/embed>/gi, '<\/NOTE_EMBED>');
//Convert b and i tags to strong and em tags
    if ((markup == 'semantic') || (markup == 'xhtml')) {
        html = html.replace(/<i(\s+[^>]*)?>/gi, '<em$1>');
        html = html.replace(/<\/i>/gi, '</em>');
        html = html.replace(/<b(\s+[^>]*)?>/gi, '<strong$1>');
        html = html.replace(/<\/b>/gi, '</strong>');
    }
//Case Changing
    html = html.replace(/<font/gi, '<font');
    html = html.replace(/<\/font>/gi, '</font>');
    html = html.replace(/<span/gi, '<span');
    html = html.replace(/<\/span>/gi, '</span>');
    if ((markup == 'semantic') || (markup == 'xhtml') || (markup == 'css')) {
        html = html.replace(new RegExp('<font([^>]*)face="([^>]*)">(.*?)<\/font>', 'gi'), '<span $1 style="font-family: $2;">$3</span>');
        html = html.replace(/<u/gi, '<span style="text-decoration: underline;"');
        if (browser() == 'webkit') {
            html = html.replace(new RegExp('<span class="Apple-style-span" style="font-weight: bold;">([^>]*)<\/span>', 'gi'), '<strong>$1</strong>');
            html = html.replace(new RegExp('<span class="Apple-style-span" style="font-style: italic;">([^>]*)<\/span>', 'gi'), '<em>$1</em>');
        }
        html = html.replace(/\/u>/gi, '/span>');
        if (markup == 'css') {
            html = html.replace(/<em([^>]*)>/gi, '<i$1>');
            html = html.replace(/<\/em>/gi, '</i>');
            html = html.replace(/<strong([^>]*)>/gi, '<b$1>');
            html = html.replace(/<\/strong>/gi, '</b>');
            html = html.replace(/<b/gi, '<span style="font-weight: bold;"');
            html = html.replace(/\/b>/gi, '/span>');
            html = html.replace(/<i/gi, '<span style="font-style: italic;"');
            html = html.replace(/\/i>/gi, '/span>');
        }
        html = html.replace(/  /gi, ' '); //Replace all double spaces and replace with a single
    } else {
        html = html.replace(/<u/gi, '<u');
        html = html.replace(/\/u>/gi, '/u>');
    }
    html = html.replace(/<ol([^>]*)>/gi, '<ol$1>');
    html = html.replace(/\/ol>/gi, '/ol>');
    html = html.replace(/<li/gi, '<li');
    html = html.replace(/\/li>/gi, '/li>');
    html = this.filter_safari(html);
    html = this.filter_internals(html);
    html = this.filter_all_rgb(html);
//Replace our backups with the real thing
    html = this.post_filter_linebreaks(html, markup);
    if (markup == 'xhtml') {
        html = html.replace(/<NOTE_IMG([^>]*)>/g, '<img $1 />');
        html = html.replace(/<NOTE_INPUT([^>]*)>/g, '<input $1 />');
    } else {
        html = html.replace(/<NOTE_IMG([^>]*)>/g, '<img $1>');
        html = html.replace(/<NOTE_INPUT([^>]*)>/g, '<input $1>');
    }
    html = html.replace(/<NOTE_UL([^>]*)>/g, '<ul$1>');
    html = html.replace(/<\/NOTE_UL>/g, '<\/ul>');
    html = this.filter_invalid_lists(html);
    html = html.replace(/<NOTE_BQ([^>]*)>/g, '<blockquote$1>');
    html = html.replace(/<\/NOTE_BQ>/g, '<\/blockquote>');
    html = html.replace(/<NOTE_EMBED([^>]*)>/g, '<embed$1>');
    html = html.replace(/<\/NOTE_EMBED>/g, '<\/embed>');
//This should fix &amp;s in URL's
    html = html.replace(' &amp; ', 'NOTE_AMP');
    html = html.replace('&amp;', '&');
    html = html.replace('NOTE_AMP', '&amp;');
    /*if (this.get('removeLineBreaks')) {
      html = html.replace(/\n/g, '').replace(/\r/g, '');
      html = html.replace(/  /gi, ' '); //Replace all double spaces and replace with a single
    }*/
//First empty span
    if (html.substring(0, 6).toLowerCase() == '<span>')  {
        html = html.substring(6);
//Last empty span
        if (html.substring(html.length - 7, html.length).toLowerCase() == '</span>')  {
            html = html.substring(0, html.length - 7);
        }
    }
    return html;
}

/**
 * @method filter_invalid_lists Taken and modified from YUI
 * @param String html The HTML string to filter
 * @description Filters invalid ol and ul list markup, converts this: <li></li><ol>..</ol> to this: <li></li><li><ol>..</ol></li>
 */
function filter_invalid_lists(html) {
    html = html.replace(/<\/li>\n/gi, '</li>');
    html = html.replace(/<\/li><ol>/gi, '</li><li><ol>');
    html = html.replace(/<\/ol>/gi, '</ol></li>');
    html = html.replace(/<\/ol><\/li>\n/gi, "</ol>\n");
    html = html.replace(/<\/li><ul>/gi, '</li><li><ul>');
    html = html.replace(/<\/ul>/gi, '</ul></li>');
    html = html.replace(/<\/ul><\/li>\n?/gi, "</ul>\n");
    html = html.replace(/<\/li>/gi, "</li>\n");
    html = html.replace(/<\/ol>/gi, "</ol>\n");
    html = html.replace(/<ol>/gi, "<ol>\n");
    html = html.replace(/<ul>/gi, "<ul>\n");
    return html;
}

/**
 * @method filter_safari Taken and modified from YUI
 * @param String html The HTML string to filter
 * @description Filters strings specific to Safari
 * @return String
 */
function filter_safari(html) {
    if (browser() == 'webkit') {
        //<span class="Apple-tab-span" style="white-space:pre">	</span>
        html = html.replace(/<span class="Apple-tab-span" style="white-space:pre">([^>])<\/span>/gi, '&nbsp;&nbsp;&nbsp;&nbsp;');
        html = html.replace(/Apple-style-span/gi, '');
        html = html.replace(/style="line-height: normal;"/gi, '');
        //Remove bogus LI's
        html = html.replace(/<li><\/li>/gi, '');
        html = html.replace(/<li> <\/li>/gi, '');
        html = html.replace(/<li>  <\/li>/gi, '');
        //Remove bogus DIV's - updated from just removing the div's to replacing /div with a break
        if (this.get('ptags')) {
            html = html.replace(/<div([^>]*)>/g, '<p$1>');
            html = html.replace(/<\/div>/gi, '</p>');
        } else {
            html = html.replace(/<div>/gi, '');
            html = html.replace(/<\/div>/gi, '<br>');
        }
    }
    return html;
}

/**
 * @method filter_internals Taken and modified from YUI
 * @param String html The HTML string to filter
 * @description Filters internal RTE strings and bogus attrs we don't want
 * @return String
 */
function filter_internals(html) {
    html = html.replace(/\r/g, '');
//Fix stuff we don't want
    html = html.replace(/<\/?(body|head|html)[^>]*>/gi, '');
//Fix last BR in LI
    html = html.replace(/<NOTE_BR><\/li>/gi, '</li>');
    html = html.replace(/note-tag-span/gi, '');
    html = html.replace(/note-tag/gi, '');
    html = html.replace(/note-non/gi, '');
    html = html.replace(/note-img/gi, '');
    html = html.replace(/ tag="span"/gi, '');
    html = html.replace(/ class=""/gi, '');
    html = html.replace(/ style=""/gi, '');
    html = html.replace(/ class=" "/gi, '');
    html = html.replace(/ class="  "/gi, '');
    html = html.replace(/ target=""/gi, '');
    html = html.replace(/ title=""/gi, '');
    if (browser() == 'ie') {
        html = html.replace(/ class= /gi, '');
        html = html.replace(/ class= >/gi, '');
        html = html.replace(/_height="([^>])"/gi, '');
        html = html.replace(/_width="([^>])"/gi, '');
    }
    return html;
}

/**
 * @method filter_all_rgb Taken and modified from YUI
 * @param String str The HTML string to filter
 * @description Converts all RGB color strings found in passed string to a hex color, example: style="color: rgb(0, 255, 0)" converts to style="color: #00ff00"
 * @return String
 */
function filter_all_rgb(str) {
    var exp = new RegExp("rgb\\s*?\\(\\s*?([0-9]+).*?,\\s*?([0-9]+).*?,\\s*?([0-9]+).*?\\)", "gi");
    var arr = str.match(exp);
    if(Object.prototype.toString.call( arr ) === '[object Array]'){
        for (var i = 0; i < arr.length; i++) {
            var color = this.filter_rgb(arr[i]);
            str = str.replace(arr[i].toString(), color);
        }
    }
    return str;
}

/**
 * @method filter_rgb Taken and modified from YUI
 * @param String css The CSS string containing rgb(#,#,#);
 * @description Converts an RGB color string to a hex color, example: rgb(0, 255, 0) converts to #00ff00
 * @return String
 */
function filter_rgb(css) {
    if (css.toLowerCase().indexOf('rgb') != -1) {
        var exp = new RegExp("(.*?)rgb\\s*?\\(\\s*?([0-9]+).*?,\\s*?([0-9]+).*?,\\s*?([0-9]+).*?\\)(.*?)", "gi");
        var rgb = css.replace(exp, "$1,$2,$3,$4,$5").split(',');
        if (rgb.length == 5) {
            var r = parseInt(rgb[1], 10).toString(16);
            var g = parseInt(rgb[2], 10).toString(16);
            var b = parseInt(rgb[3], 10).toString(16);
            r = r.length == 1 ? '0' + r : r;
            g = g.length == 1 ? '0' + g : g;
            b = b.length == 1 ? '0' + b : b;
            css = "#" + r + g + b;
        }
    }
    return css;
}

/**
 * @method pre_filter_linebreaks Taken and modified from YUI
 * @param String html The HTML to filter
 * @param String markup The markup type to filter to
 * @description HTML Pre Filter
 * @return String
 */
function pre_filter_linebreaks(html, markup) {
    if (browser() == 'webkit') {
        html = html.replace(/<br class="khtms-block-placeholder">/gi, '<NOTE_BR>');
        html = html.replace(/<br class="webkit-block-placeholder">/gi, '<NOTEI_BR>');
    }
    html = html.replace(/<br>/gi, '<NOTE_BR>');
    html = html.replace(/<br (.*?)>/gi, '<NOTE_BR>');
    html = html.replace(/<br\/>/gi, '<NOTE_BR>');
    html = html.replace(/<br \/>/gi, '<NOTE_BR>');
    html = html.replace(/<div><NOTE_BR><\/div>/gi, '<NOTE_BR>');
    html = html.replace(/<p>(&nbsp;|&#160;)<\/p>/g, '<NOTE_BR>');
    html = html.replace(/<p><br>&nbsp;<\/p>/gi, '<NOTE_BR>');
    html = html.replace(/<p>&nbsp;<\/p>/gi, '<NOTE_BR>');
//Fix last BR
    html = html.replace(/<NOTE_BR>$/, '');
//Fix last BR in P
    html = html.replace(/<NOTE_BR><\/p>/g, '</p>');
    if (this.browser.ie) {
        html = html.replace(/&nbsp;&nbsp;&nbsp;&nbsp;/g, '\t');
    }
    return html;
}

/**
 * @method post_filter_linebreaks Taken and modified from YUI
 * @param String html The HTML to filter
 * @param String markup The markup type to filter to
 * @description HTML Pre Filter
 * @return String
 */
function post_filter_linebreaks(html, markup) {
    if (markup == 'xhtml') {
        html = html.replace(/<NOTE_BR>/g, '<br />');
    } else {
        html = html.replace(/<NOTE_BR>/g, '<br>');
    }
    return html;
}
