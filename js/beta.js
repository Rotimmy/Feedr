$(document).ready(function(){
  var source = [];
  getData(); // get data from all 3 sources
  $("nav .dropdown a").click(function(){
    $("#popUp").removeClass("hidden").addClass("loader");
    $("#feed").empty(); // empty feed for data
    feedArr = []; // empty feed array
    source.push($(this).text(); // define source from dropdown text
    $("nav span").text(source); // display source
    getData(source);
  });
});
// get data by source
function getData(source){
  var srcObj = {};
  // define url by source
  switch (source) {
    case "News API":
      // construct url
      var apiKey = "84840d34808a426c9fb31b0daeb68cfd",
          dataUrl = "https://newsapi.org/v2/top-headlines?country=us",
          param = {
            apiKey: apiKey
          };
      for(let key in param){
        dataUrl += "&" + key + "=" + param[key];
      };
      // get data
      newsApiGet();
      break;
    case "New York Times":
      // construct url
      var apiKey = "MIm7K8QYhpMMWq12vzcd7kEeEGqq1k82",
          dataUrl = "https://api.nytimes.com/svc/search/v2/articlesearch.json",
          topStoriesPath = "topstories/v2/home.json",
          param = {
            q: "elections",
          };
      for(let key in param){
        dataUrl += "?" + key + "=" + param[key];
      }
      dataUrl += "&api-key=" + apiKey;
      // get data
      nytGet();
      break;
    case "Google News":
      // construct data url
      var token = "2e6f332bef4159a8fa2df661bcb33ff0",
          base = "https://gnews.io/api/v3/",
          topNews = "top-news?",
          search = "search?",
          param = {
            q: "query",
            max: "10",
            image: "required"
          };
      let endpoint = topNews;
      dataUrl = base + endpoint + "token=" + token;
      // get data
      gNewsGet();
      break;
    default:
      newsApiGet();
      nytGet();
      // gNewsGet();
  };
};
// get requests:
function newsApiGet(){ // News API get request
  $.get(dataUrl).done(function(res){
    $("#popUp").addClass("hidden"); //hide loader when data retrieved
    let artArr = res.articles;
    if(artArr.length === 0){
      console.log("Sorry, we could not find any articles matching your query");
    } else {
      fetchArticles(res, source, artArr);
    }
  });
};
function nytGet(){ // NYT get request
  $.get(dataUrl).done(function(res){
    //hide loader
    let artArr = res.response.docs;
    $("#popUp").addClass("hidden");
    if(artArr.length === 0){
      console.log("Sorry, we could not find any articles matching your query");
    } else {
      fetchArticles(res, source, artArr);
    }
  });
};
function gNewsGet(){ // GNews get request
  $.get(dataUrl).done(function(res){
    $("#popUp").addClass("hidden"); // hide loader when data retrieved
    let artArr = res.articles; //
    if(artArr.length === 0){
      console.log("Sorry, we could not find any articles matching your query");
    } else {
      fetchArticles(res, source, artArr);
    }
  });
};

function fetchArticles(res, source, artArr){
  // iterate through articles
  $.each(artArr, function(i){
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
  });
  // sort articles by date
  feedArr.sort((a, b) => (a.date > b.date) ? -1 : 1);
  // load feed
  loadFeed(feedArr);
};

function loadFeed(feedArr){
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
            // if article does not have image use alt image
            if ($this.img == null || $this.img == undefined || $this.img == "http://static01.nyt.com/"){
              $(section).css("background-image", "url('" + $this.alt + "')");
            } else {
              $(section).css("background-image", "url('" + $this.img + "')");
            }
            // $("<img>").attr("src", imgUrl).appendTo(section);
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
      .on("click", "h3", function(event) {
        event.preventDefault();
        let target = event.target;
        // match article title to load article data
        console.log($this);
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
