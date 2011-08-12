 function getXMLHTTPRequest() 
 { try { req = new XMLHttpRequest(); } catch(err1) { try { req = new ActiveXObject("Msxml2.XMLHTTP"); } catch (err2) { try { req = new ActiveXObject("Microsoft.XMLHTTP"); } catch (err3) { req = false; } } } return req; } var http = getXMLHTTPRequest(); function checklinks() { var txt = ''; var j = document.getElementsByTagName('a').length; for(var i = 0; i < (j-1); i++) // iterate through the links { lnk = document.getElementsByTagName('a')[i]; txt = txt + lnk.href + "|"; // build the link list } lnk = document.getElementsByTagName('a')[j-1]; txt = txt + lnk.href; // no divider after last one var myurl = 'linkchecker.php?list='; myRand = parseInt(Math.random()*999999999999999); var modurl = myurl+txt+"&rand="+myRand; http.open("GET", modurl, true); http.onreadystatechange = useHttpResponse; http.send(null); } function useHttpResponse() { if (http.readyState == 4) { if(http.status != 200) { alert('Link Check Problem'); } } }
 
 
jQuery.fn.linkChecker = function(settings) {  
    if(!this.length) return;
    settings = jQuery.extend({                                                                
                                                            linksAtOnce: 2,
                                                            checkScript: 'checklinks.php',
                                                            activeClass: 'active',
                                                            inactiveClass: 'inactive',
                                                            timeout: 3
                                                        }, settings);
    var urls = Array();
    this.each( function() { 
        urls.push(this.href);
    } );    
    
    while(urls.length) {
        linkSlice = Array();
        for(var i = 0; i<settings.linksAtOnce; i++) {
            if(urls.length) {
             linkSlice.push(urls.shift());
            }
        }
        checkLinks(linkSlice, settings, this);
    }
    
    
    function checkLinks(urls, settings, jLinks) {     
        jQuery.getJSON(settings.checkScript, {'links[]':urls, 'timeout':settings.timeout}, function(links){
            for(var i = 0; i<links.length; i++) {             
                jLinks.filter('[href^='+ links[i].href + ']').addClass(links[i].status == 'active' ? settings.activeClass : settings.inactiveClass);
            }
        });                
    }
