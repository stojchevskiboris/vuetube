window.onload = () => {
// searchResults.html ...

// search video function
    function call(query) {
        document.getElementById('searchInput').blur()
        var search = document.getElementById('searchInput').value
        if (query != undefined)
            search = query
        if (search == undefined || search == "")
            return


        // set main view to loading screen
        document.getElementById("results").innerHTML = '<img id="loadingGIF" src="static/loading.gif">'


        // get query parameters if they exist
        const urlParams = new URLSearchParams(window.location.search);
        const searchQ = urlParams.get('q');
        if (searchQ != null) {
            if (document.getElementById("searchInput").value == '') {
                search = searchQ
                document.getElementById('searchInput').value = searchQ
            }
        }


        // Make an HTTP GET request to the YouTube Data API search endpoint
        var apiKey = ""
        var apiKey1 = 'AIzaSyB5LG4TFaO95eqkE6yRBgJgr0egwSBSy8U'
        var apiKey2 = 'AIzaSyD1HX-in66XEtm57Ig6S2JJDQ56uXr5c2s'
        var apiKey3 = 'AIzaSyAdv9_oNyCgRE_coy3QYLlIG05bBqznx80'
        var num = Math.random()
        if (num < 0.33)
            apiKey = apiKey1
        else if (num < 0.66)
            apiKey = apiKey2
        else apiKey = apiKey3
        var q = []
        fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${search}&key=${apiKey}&maxResults=20`) // maxResults=50
            .then(response => response.json())
            .then(data => {
                // console.log(data)
                // Iterate over the retrieved videos and assign properties for each item
                data.items.forEach((item, i) => {
                    var obj = { // every item
                        isChannel: false,
                        title: item.snippet.title,
                        thumbnailUrl: item.snippet.thumbnails.high.url,
                        publishedAt: item.snippet.publishedAt
                    }
                    if (item.id.kind === "youtube#channel") { // if item is channel
                        obj.isChannel = true
                        obj.channelURL = `https://www.youtube.com/channel/${item.id.channelId}`
                        obj.publishedAt = 'Channel'
                    } else { // if item is video
                        obj.live = item.snippet.liveBroadcastContent
                        obj.watch = item.id.videoId
                        obj.videoURL = `https://www.youtube.com/watch?v=${item.id.videoId}`;
                        obj.channelURL = `https://www.youtube.com/channel/${item.snippet.channelId}`
                        obj.chTitle = item.snippet.channelTitle;
                    }
                    // store only channels and valid videos (non-null watchID)
                    if (obj.isChannel || (!obj.isChannel && obj.watch !== undefined)) {
                        q.push(obj)
                    }

                });
            })
            .catch(error => {
                console.error('Error:', error);
            });

        // create div objects ( in the implemented code the divs are hard coded)
        // TODO: in the following example, the divs are created correctly
        // ----------------------------------------------------
        // var box = document.createElement("div")
        // box.id = 'boxID'
        // document.body.querySelector("#test1").appendChild(box)
        // ----------------------------------------------------
        setTimeout(function () {
            var text = ""
            for (let x in q) {
                var vidLink = ""
                var end = ""
                var isVideo = ""
                var chLink = ""
                var openVideo = "view.html?watch=" + q[x].watch
                var d = q[x].publishedAt.slice(0, 10)
                var publishedAt = d
                var publishedAtQS = ''
                if (d != 'Channel') {
                    publishedAt = d.slice(8, 10) + '.' + d.slice(5, 7) + '.' + d.slice(0, 4)
                    publishedAtQS = publishedAt
                }

                if (q[x].live == 'live') {
                    publishedAt = '<span class="live">Live</span>'
                    publishedAtQS = 'Live'
                }

                if (!q[x].isChannel) {
                    openVideo += "&title=" + q[x].title + "&channelName=" + q[x].chTitle + "&publishedAt=" + publishedAtQS
                    isVideo = 'Channel: <a class="text-decoration-none " target="_blank" href="' + q[x].channelURL + '">' + q[x].chTitle + '</a>'
                    vidLink = '<a class="text-decoration-none " href="' + openVideo + '">' //q[x].videoURL
                    end = "</a>"
                } else {
                    chLink = '<a class="text-decoration-none " target="_blank" href=" ' + q[x].channelURL + '">'
                    end = "</a>"
                }


                text += '<div class="col mb-4">\n' +
                    '            <div class="card" style="width: 18rem;">\n' +
                    '                ' + vidLink + '<img src="' + q[x].thumbnailUrl + '" class="card-img-top" alt="...">' + end + '\n' +
                    '                <div class="card-body cb-1">\n' +
                    '<div>' +
                    '                    ' + vidLink + chLink + '<h5 class="card-title">' + q[x].title + '</h5>' + end + '\n' +
                    isVideo +
                    '</div>' +
                    '                    <p class="card-text text-end">' + publishedAt + '</p>\n' +
                    '                </div>\n' +
                    '            </div>\n' +
                    '        </div>'


                document.getElementById("results").innerHTML = text


            }
            dbContrast.get('contrast')
                .then((doc) => {
                    setContrast(doc.dark)
                })

            // error prevention timeout call if last one didnt succeed
            setTimeout(() => {
                if (document.getElementById("results").innerHTML === '<img id="loadingGIF" src="static/loading.gif">') {
                    // console.log("calling with q: " + search)
                    call(search)
                }
            }, 2000)

        }, 1200)
    }


// search button click call but with 100ms delay
    setTimeout(() => {
        document.getElementById("bt1").onclick = function () {
            call()
        }
    }, 100)


// Enter key usage instead of clicking search button with mouse
    function focusFunc() {
        var input = document.getElementById("searchInput");
        input.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                call()
            }
        });
    }

// Call on first view
    setTimeout(() => {
        call("programming")
    }, 200)

}