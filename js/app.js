let feedArr = [];

$(window).load(function() {

  mainFeed(); // call aggregate "main" feed
  // select single source
  $("nav .dropdown a").click(function(){
    $("#popUp").removeClass("hidden").addClass("loader");
    $("#feed").empty(); // empty feed for new data
    feedArr = []; // empty feed array
    source = $(this).text(); // define source from dropdown text
    $("nav span").text(source);
    switch (source) {
      case "News API":
        newsApiGet();
        break;
      case "New York Times":
        nytGet();
        break;
      case "Google News":
        gNewsGet();
        break;
    };
  });
  // home/main feed
  $("#brand").click(function(e){
    e.preventDefault();
    $("#feed").empty(); // empty feed for data
    feedArr = []; // empty feed array
    mainFeed();
  });
  //search bar
  searchBar();
});
// main Feed
function mainFeed(){
  newsApiGet();
  nytGet();
  gNewsGet();
};
// News API
function newsApiGet(){
  let apiKey = "84840d34808a426c9fb31b0daeb68cfd",
      source = "News API",
      url = "https://newsapi.org/v2/top-headlines?country=us",
      param = {
        apiKey: apiKey
      };
  for(let key in param){
    url += "&" + key + "=" + param[key];
  }

  $.get(url).done(function(res){
    //hide loader
    $("#popUp").addClass("hidden");
    if(res.articles.length === 0){
      console.log("Sorry, we could not find any articles matching your query");
    } else {
      fetchArticles(res, source);
    }
  });
};
// NYT
function nytGet(){
  let apiKey = "MIm7K8QYhpMMWq12vzcd7kEeEGqq1k82",
      source = "New York Times",
      base = "https://api.nytimes.com/svc/",
      searchPath = "search/v2/articlesearch.json",
      topStoriesPath = "topstories/v2/home.json",
      param = {
        q: "U.S.",
      };
  for(let key in param){
    searchPath += "?" + key + "=" + param[key];
  }
  var url = base + searchPath + "&api-key=" + apiKey;

  $.get(url).done(function(res){
    //hide loader
    $("#popUp").addClass("hidden");
    if(res.response.docs.length === 0){
      console.log("Sorry, we could not find any articles matching your query");
    } else {
      fetchArticles(res, source);
    }
  });
};
// Google news
function gNewsGet(){
  let token = "2e6f332bef4159a8fa2df661bcb33ff0",
      source = "Google News",
      base = "https://gnews.io/api/v3/",
      topNews = "top-news?",
      search = "search?",
      param = {
        q: "query",
        max: "10",
        image: "required"
      };
  // if(search){
  //   let endpoint = search;
  //   for(let key in param){
  //     endpoint += "&" + key + "=" + param[key];
  //   };
  // } else {
  //   let endpoint = topNews;
  // }
  let endpoint = topNews;

  url = base + endpoint + "token=" + token;

  $.get(url).done(function(res){
    //hide loader
    $("#popUp").addClass("hidden");
    if(res.articles === 0){
      console.log("Sorry, we could not find any articles matching your query");
    } else {
      fetchArticles(res, source);
    }
  });
};
// fetch articles and push to an array
function fetchArticles(res, source){
  // define articleArr by source
  switch (source) {
    case "News API":
      var articleArr = res.articles;
      break;
    case "New York Times":
      var articleArr = res.response.docs;
      break;
    case "Google News":
      var articleArr = res.articles;
      break;
    default:
      var articleArr = res.articles;
  };
  // iterate through articles
  $.each(articleArr, function(i){
    let $this = this;
    // define variables by source
    switch (source) {
      case "News API":
        var articleSource = $this.source.name,
            articleTitle = $this.title,
            articleUrl = $this.url,
            imgUrl = $this.urlToImage,
            imgAlt = "images/Google_News_icon.png",
            abstract = $this.description,
            date = new Date($this.publishedAt); // standardize date format
        break;
      case "Google News":
        var articleSource = $this.source.name,
            articleTitle = $this.title,
            articleUrl = $this.url,
            imgUrl = $this.image,
            imgAlt = "images/Google_News_icon.png",
            abstract = $this.description,
            date = new Date($this.publishedAt); // standardize date format
        break;
      case "New York Times":
        var articleSource = "New York Times",
            articleTitle = $this.headline.main,
            articleUrl = $this.web_url,
            imgUrl = "http://static01.nyt.com/",
            imgAlt = "images/nyt-t-logo.png",
            abstract = $this.lead_paragraph,
            date = new Date($this.pub_date); // standardize date format
            if($this.multimedia[0]){ // add path only if article has image
              imgUrl += $this.multimedia[0].url;
            }
        break;
        default:
    };
    // create obj and push to array
    let articleObj = {
      "source": articleSource,
      "title": articleTitle,
      "url": articleUrl,
      "img": imgUrl,
      "alt": imgAlt,
      "desc": abstract,
      "date": date
    };
  feedArr.push(articleObj);
  //   let urlArr = feedArr.map(function(obj){
  //     return obj.url;
  //   });
  //   // console.log(urlArr);
  //
  //   if (!urlArr.includes(articleObj.url)){
  //
  //   };
  });
  loadFeed();// load feed
};
// populate feed
function loadFeed(){
  // sort articles by date
  feedArr.sort((a, b) => (a.date > b.date) ? -1 : 1);
  $.each(feedArr, function(){
    let $this = this;
    // load articles
    if($this.title !== ""){
      // create variable for article element with class "article"
      let article = $("<article></article>").addClass("article");
      // create array of classes for each section
      let sectionArr = [ "featuredImage", "articleContent", "impressions" ];
      // dynamically add 3 sections with unique class names to each article
      $.each(sectionArr, function(i){
        let section = $("<section></section>");
        // add class to section
        $(section).addClass(sectionArr[i]);
        // create inner content for each section
        switch (sectionArr[i]) {
          case "featuredImage":
            // Get image or if article does not have an image use alt image
            if ($this.img == null || $this.img == undefined || $this.img == "http://static01.nyt.com/"){
              $(section).css("background-image", "url('" + $this.alt + "')");
            } else {
              $(section).css("background-image", "url('" + $this.img + "')");
            }
            break;
          case "articleContent":
            let anchor = $("<a></a>").attr("href", $this.url),
              title = $("<h3>" + $this.title + "</h3>"),
              articleSource = $this.source;
            $(anchor).append(title);
            $(section).append(anchor).append(articleSource);
            break;
          case "impressions":
            $("<img>").attr("src", "images/expandth.png").appendTo(section);
            break;
        };
        // append section to article
        $(article).append(section);
      });
      // append article to feed
      $(article).appendTo("#feed");
    };
    // popUp
    $("#feed")
      .on("click", "h3", function(e) {
        e.preventDefault();
        let target = e.target;
        // match article title to load article data
        if($(target).text() == $this.title){
          $("#popUp h1").text($this.title);
          $("#popUp p").text($this.desc);
          $("a.popUpAction").attr("href", $this.url);
          $("#popUp").removeClass("loader").removeClass("hidden");
          $("#popUp .container").show();
        };
    });
    // hide popUp
    $(".closePopUp").click(function(){
      $("#popUp").addClass("hidden");
    });
  });
};

function searchBar(){
  $("#search a").click(function(){
    $("#search").toggleClass("active");
    $("input").focus();
    $("#search input").val(""); // clear input
  });
  // filter articles
  $("#search input").on("keyup", function() {
    let value = $(this).val().toLowerCase();
    $("#feed .article").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
  // hide input on enter key
  $('#search input').keypress(function(event){
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13'){
      $("#search").removeClass("active");
      $("#popUp").removeClass("hidden").addClass("loader");
      let value = $(this).val(); // grab search input and pass in to search function
      search(value);
    };
  });
};

function search(value) {
  let apiKey = "84840d34808a426c9fb31b0daeb68cfd",
      source = "News API",
      url = "https://newsapi.org/v2/everything?",
      query = value.split(" "), // create an array of search terms
      param = {
        "apiKey": apiKey
      };
  // iterate through query array
  $.each(query, function(i){
    url += "q=" + query[i] + "&";
  });
  for(let key in param){
    url += key + "=" + param[key];
  };
  console.log(url);
  $.get(url).done(function(res){
    //hide loader
    $("#popUp").addClass("hidden");
    if(res.articles.length === 0){
      console.log("Sorry, we could not find any articles matching your query");
    } else {
      fetchArticles(res, source);
    };
  });
};

// custom caret
// let caret = true,
//     speed = 800,
//     caretEl = "<span id='caret'>|</span>";
//
//   $(caretEl).prependTo("#search");
//
//   setInterval(() => {
//     if (caret) {
//       $('#caret').css("opacity", 0);
//       caret = false;
//     } else {
//       $('#caret').css("opacity", 1);
//       caret = true;
//     }
//   }, speed);
//
