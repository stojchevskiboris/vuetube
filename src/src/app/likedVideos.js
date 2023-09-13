window.onload = () => {
    function focusFunc() {
        var input = document.getElementById("searchInput");
        input.addEventListener("keypress", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                call()
            }
        });
    }

// search function
    function call() {
        document.getElementById('searchInput').blur()
        var search = document.getElementById('searchInput').value
        if (search == undefined || search == "")
            return
        window.location.href = 'searchResults.html?q=' + search
    }

// retrieve liked videos
    db.allDocs({include_docs: true, descending: true}, function (err, doc) {
        // console.log(doc.rows)
        likedVideos = doc.rows
    });

// clear liked videos list
    function deleteAllLikedVideos() {
        setTimeout(() => {
            for (let x in likedVideos) {
                db.remove(likedVideos[x].doc)
            }
        }, 1000)
    }

// displa
    setTimeout(function () {
        var text = ""
        if (likedVideos.length == 0) {
            document.getElementById("results").innerHTML = '<h5>You don`t have liked videos</h5>'
        }

        for (let x in likedVideos) {
            var title = likedVideos[x].doc.title
            // console.log(title)
            var id = likedVideos[x].doc._id
            var publishedAt = likedVideos[x].doc.publishedAt
            var channelName = likedVideos[x].doc.channelName
            var liveClass = ''
            if (publishedAt == "Live")
                liveClass = ' live live2 '
            text +=
                '<div class="col mb-4">' +
                '<div class="card" style="width: 20rem">' +
                '<a class="text-decoration-none" href="view.html?watch=' + id + '&amp;title=' + title + '&amp;channelName=' + channelName + '&amp;publishedAt=' + publishedAt + '">' +
                '<img src="https://img.youtube.com/vi/' + id + '/0.jpg" class="card-img-top" alt="..."></a>' +
                '<div class="card-body cb-1">' +
                '<div><a class="text-decoration-none" href="view.html?watch=' + id + '&amp;title=' + title + '&amp;channelName=' + channelName + '&amp;publishedAt=' + publishedAt + '">' +
                '<h5 class="card-title">' + title + '</h5></a>' +
                'Channel: ' + channelName + '</div>' +
                '<p class="card-text text-end' + liveClass + '">' + publishedAt + '</p>' +
                '</div>' +
                '</div>' +
                '</div>'


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

    document.getElementById("bt1").onclick = () => {
        call()
    }
    document.getElementById("searchInput").onclick = () => {
        focusFunc()
    }
}