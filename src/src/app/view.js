window.onload = () => {
// view.html ...

// get query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const watchID = urlParams.get('watch');
    const title = urlParams.get('title');
    const channelName = urlParams.get('channelName');
    const publishedAt = urlParams.get('publishedAt');
// console.log(watchID)
// console.log(title)
// console.log(channelName)
    if (watchID == null)
        window.location.href = 'index.html'
    setTimeout(() => {
        document.getElementById('player').src = 'http://www.youtube.com/embed/' + watchID
        document.getElementById('watchTitle').innerText = title
        document.getElementById('channelName').innerText = channelName
        document.getElementById('publishedAt').innerText = 'Published at: ' + publishedAt
    }, 200)


    setTimeout(() => {
        // console.log(window.top.document.querySelector('iframe'))
        var a = document.querySelector('iframe')
        // console.log(a)
    }, 2500)

    function focusFunc() {
        var input = document.getElementById("searchInput");
        input.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                call()
            }
        });
    }

    function call() {
        document.getElementById('searchInput').blur()
        var search = document.getElementById('searchInput').value
        if (search == undefined || search == "")
            return
        window.location.href = 'searchResults.html?q=' + search
    }


    setTimeout(() => {
        document.getElementById("like").onclick = function () {
            // console.log("test")
            addVideo(watchID)
        }
    }, 100)

    setTimeout(() => {
        document.getElementById("unlike").onclick = function () {
            // console.log("test")
            removeVideo(watchID)
        }
    }, 100)

    var isLiked = false
    db.get(watchID).then(() => {
        isLiked = true
    }).catch(() => {
            isLiked = false
        }
    )
    setTimeout(() => {
        if (isLiked) {
            document.getElementById("unlike").style.display = 'block'
        } else {
            document.getElementById("like").style.display = 'block'

        }
    }, 400)

    db.allDocs({include_docs: true, descending: true}, function (err, doc) {
        // console.log(doc.rows)
        likedVideos = doc.rows
    });


    function callRecommended(query) {
        // document.getElementById('searchInput').blur()

        // set main view to loading screen
        document.getElementById("results").innerHTML = '<img id="loadingGIF" src="static/loading.gif">'


        // get query parameters if they exist
        var search = title


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
        fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${search}&key=${apiKey}&maxResults=11`) // maxResults=50
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


                text += '<div class="col m-4">\n' +
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

                if (q[x].watch === watchID)
                    text = '' // delete recommended video matching same watchID
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
            }, 1500)

        }, 800)
    }

    setTimeout(() => {
        callRecommended()
    }, 200)


    document.getElementById("bt1").onclick = () => {
        call()
    }
    document.getElementById("searchInput").onclick = () => {
        focusFunc()
    }

    // add video to liked videos
    function addVideo(watchID) {
        var video = {
            _id: watchID,
            title: title,
            channelName: channelName,
            publishedAt: publishedAt,
            dateAdded: new Date().toLocaleString(),
            userSession: localStorage.getItem('sessionId')
        };
        db.put(video)
            .then(() => {
                setTimeout(() => {
                    document.getElementById("like").style.display = 'none'
                    document.getElementById("unlike").style.display = 'block'
                }, 100)
            })


    }

// remove video from liked videos
    function removeVideo(watchID) {
        db.get(watchID)
            .then((x) => {
                db.remove(x)
                setTimeout(() => {
                    document.getElementById("like").style.display = 'block'
                    document.getElementById("unlike").style.display = 'none'
                }, 100)
            })
    }


//////////////////////////////
}