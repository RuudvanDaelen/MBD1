// Initialize your app
var myApp = new Framework7();

// Export selectors engine
var $$ = Dom7;


//Infinite scroll variables
var loading = false;
var lastIndex = $$('.list-block li').length;
var maxItems = 811; //moet gezet worden met ajaxcall result.count (totaal aantal van pokemons)
var itemsPerLoad = 20; //instellbaar met settings?
var next = "http://pokeapi.co/api/v2/pokemon/?limit=20";





// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

// Callbacks to run specific code for specific pages, for example for About page:
/*myApp.onPageInit('about', function (page) {
    // run createContentPage func after link was clicked
    $$('.create-page').on('click', function () {
        createContentPage();
    });
    alert('test');
});*/

// Generate dynamic page
/*var dynamicPageIndex = 0;
function createContentPage() {
	mainView.router.loadContent(
        '<!-- Top Navbar-->' +
        '<div class="navbar">' +
        '  <div class="navbar-inner">' +
        '    <div class="left"><a href="#" class="back link"><i class="icon icon-back"></i><span>Back</span></a></div>' +
        '    <div class="center sliding">Dynamic Page ' + (++dynamicPageIndex) + '</div>' +
        '  </div>' +
        '</div>' +
        '<div class="pages">' +
        '  <!-- Page, data-page contains page name-->' +
        '  <div data-page="dynamic-pages" class="page">' +
        '    <!-- Scrollable page content-->' +
        '    <div class="page-content">' +
        '      <div class="content-block">' +
        '        <div class="content-block-inner">' +
        '          <p>Here is a dynamic page created on ' + new Date() + ' !</p>' +
        '          <p>Go <a href="#" class="back">back</a> or go to <a href="services.html">Services</a>.</p>' +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '  </div>' +
        '</div>'
    );
	return;
}*/


//Wordt direct uitgevoerd wanneer my-app.js wordt geladen in de pagina
$.ajax({url: "http://pokeapi.co/api/v2/pokemon/?limit=20", success: function(result){
        //alert("Aantal pokemons: " + result.count + "\n" + result.next);
        
        //Zet maxItems voor infinite scroll
        maxItems = result.count;
        next = result.next;
        
        $.each(result.results, function(i, item) {
            //var pokemonItem = { name : item.name, href: item.url }
            
            //Id
            var regMatch = item.url.match(/\d+\/$/);
            var pokemonId = regMatch[0].slice(0, -1);
            //Image
            var imageUrl = "http://pokeapi.co/media/img/" + pokemonId + ".png";
            //Name (eerste letter uppercase maken)
            var lowerName = item.name;
            var pokemonName = lowerName.toLowerCase().replace(/\b[a-z]/g, function(letter) {
               return letter.toUpperCase(); 
            });
            
            
            
            var pokemon = { id: pokemonId, name: pokemonName, href: item.url, image: imageUrl }
            //alert(pokemon.id + ": " + pokemon.name + ": " + pokemon.href + ": " + pokemon.image);
            
            var html = "<li>";
                html += "<a href='detail.html' class='item-link item-content'>";
                    html += "<div class='item-media'>";
                        html += "<img height='88px' width='88px' src='"+ pokemon.image +"'>";
                    html += "</div>";
                    html += "<div class='item-inner'>";
                        html += "<div class='item-title-row'>";
                            html += "<div class='item-title'>"+ pokemon.name +"</div>";
                        html += "</div>";
                        html += "<div class='item-subtitle'># "+ pokemon.id +"</div>";
                    html += "</div>";
                html += "</a>";
            html += "</li>"; 
            $("#pokemon-list ul").append(html);
        });
}});


//Infinite Scroll

$$('.infinite-scroll').on('infinite', function() {
   if(loading) return;
   
   loading = true;
   
   setTimeout(function() {
        loading = false;
        
        if(lastIndex >= maxItems) {
            myApp.detachInfiniteScroll($$('.infinite-scroll'));
            $$('.infinite-scroll-preloader').remove();
            return;
        }
        
        //ajax call
        $.ajax({url: next, success: function(result){
        //alert("Aantal pokemons: " + result.count + "\n" + result.next);
        
        //Zet maxItems voor infinite scroll
        maxItems = result.count;
        next = result.next;
            $.each(result.results, function(i, item) {
                //var pokemonItem = { name : item.name, href: item.url }
                
                //Id
                var regMatch = item.url.match(/\d+\/$/);
                var pokemonId = regMatch[0].slice(0, -1);
                //Image
                var imageUrl = "http://pokeapi.co/media/img/" + pokemonId + ".png";
                //Name (eerste letter uppercase maken)
                var lowerName = item.name;
                var pokemonName = lowerName.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                return letter.toUpperCase(); 
                });
                
                
                
                var pokemon = { id: pokemonId, name: pokemonName, href: item.url, image: imageUrl }
                //alert(pokemon.id + ": " + pokemon.name + ": " + pokemon.href + ": " + pokemon.image);
                
                var html = "<li>";
                    html += "<a href='detail.html' class='item-link item-content'>";
                        html += "<div class='item-media'>";
                            html += "<img height='88px' width='88px' src='"+ pokemon.image +"'>";
                        html += "</div>";
                        html += "<div class='item-inner'>";
                            html += "<div class='item-title-row'>";
                                html += "<div class='item-title'>"+ pokemon.name +"</div>";
                            html += "</div>";
                            html += "<div class='item-subtitle'># "+ pokemon.id +"</div>";
                        html += "</div>";
                    html += "</a>";
                html += "</li>"; 
                $("#pokemon-list ul").append(html);
            });
        }});
        
        
        
        
        
        
        
        
        
        var html = "";
        for(var i = lastIndex + 1; i <= lastIndex + itemsPerLoad; i++) {
            
        } 

        $$('.pokemon-list ul').append(html);
        lastIndex = $$('pokemon-list li').length; 
   }, 1000);
});
