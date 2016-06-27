// downloadl.ink | givl.ink | directl.ink | portl.ink | squid.ink | squidl.ink
// octol.ink | omnil.ink | integral.ink | veral.ink |
// fs.lunik.xyz/#0337d58a486bebd6be450f60dd02e95042ca2350
// small music: fs.lunik.xyz/#e06391491356e372aed67f4bdfca801d8899c117
// small zip: eedf3cc0ae3f877b849b1da70356a06f717f83d0

// auto open new window: window.open(url, '_blank');


// Initialize event on torrent. Mostly status
function initTorrent(torrent) {
  torrent.on('metadata', function() {
    console.log('metadata: ', torrent.name);
  });
  torrent.on('ready', function() {
    console.log('ready: ', torrent);
    console.log('appending to holder');
    appendHolder(torrent);
  });
  torrent.on('download', function(chunkSize) {
    updateStats(torrent.progress,
      torrent.uploadSpeed,
      torrent.downloadSpeed,
      torrent.numPeers,
      torrent.uploaded,
      torrent.downloaded,
      torrent.ratio,
      torrent.timeRemaining);
  });
  torrent.on('wire', function(wire) {
    console.log('wire: ', wire.remoteAddress + ":" + wire.remotePort);
  });
  torrent.on('done', function() {
    console.log('torrent complete');
    updateStats(torrent.progress, 0, 0,
      torrent.numPeers,
      torrent.uploaded,
      torrent.downloaded,
      torrent.ratio,
      0);
  });
  torrent.on('upload', function() {
    console.log('upload: ', torrent.name);
    updateStats(torrent.progress, 0, 0,
      torrent.numPeers,
      torrent.uploaded,
      torrent.downloaded,
      torrent.ratio,
      0);
  });
  torrent.on('noPeers', function() {
    console.log('noPeers: ', torrent.name);
    console.log('seeding');
  });
}


// turn magnet into hash
function cleanHash (hash) {
  var r = new RegExp('.*:')
  var r2 = new RegExp('&.*')
  return hash.replace(r, '').replace(r2, '')
}

// Get the hash and start torrent if there is a hash
// function getHash(hash) {
function getHash(hash) {
  hash = cleanHash(hash);
  download(hash);
}

// Download a torrent
function download(hash) {
  var client = new WebTorrent();
  var torrent = client.add({
    infoHash: hash,
    announce: TRACKERS
  }, onTorrentDownload);
  initTorrent(torrent);
}

// Seed a file (specifically for starting a torrent)
// (Finishing a download automatically seeds)
function seed(file) {
  console.log(file);
  var client = new WebTorrent();
  var torrent = client.seed(file, {
    announce: TRACKERS
  }, onTorrentSeed);
  initTorrent(torrent);
}
// ===================== Callbacks ======================= //

// Callback on torrent finish
function onTorrentDownload(torrent) {
  console.log('Downloading ' + torrent.name);
  destroy(torrent);
}

// Callback for when torrent is seeding
function onTorrentSeed(torrent) {
  var idHash;
  // Make a post to addOrCreate and return the hash(id) for sharing
  $.post('/new/' + torrent.infoHash, {}, function(returned) {
    console.log('got back the post, ', returned);
    idHash = returned.id;
    $('.share-link').text(idHash);
    history.pushState('data', '', '/' + idHash);
    $('.before-box').addClass('hide');
  });

  console.log('Seeding ' + torrent.name);
  console.log('Hash: ' + torrent.infoHash);
  console.log('peerNum: ' + torrent.numPeers);
  // var link = document.location.hostname + document.location.pathname + '/#' + torrent.infoHash
  // console.log('THE LINK: ' + link);
  destroy(torrent);
}

// Graceful torrent destruction on page close
function destroy(torrent) {
  $(window).on('unload', function() {
    torrent.destroy(console.log('torrent object destroyed gracefully'));
  });
};

// ================================================ //

// Append the torrent to the holder in HTML
// Mostly for video/audio at this point
function appendHolder(torrent) {

  torrent.files.forEach(function(file) {
    console.log('inside forEach. Item: ' + file);

    // Check if the extension is mp4, m4v, m4a, mkv, mp3
    // Only run if the extension IS. This will place the video player in
    // but not anything else [as raw text]
    if ( mediaFormats.indexOf(getExtension(file.name)) !== -1 ) {
      $('.before-box').addClass('hide');
      $('.after-box-media').removeClass('hide');

      file.appendTo('.after-box-media', function(error) {
        console.log('inside appendTo()');
        // If it is not a video, error == true.
        if (error) {
          console.log('error in appendHolder(). Must not be playable media');
        }
      });
    }

    // This seems to only run if it is not playable media :S.
    // Cant get link without it running
    file.getBlobURL(function(error, url) {
      console.log('inside getBlobURL');

      // Check if video is showing before showing download box
      // if ( $('.after-box-media').hasClass('hide') ) {
      //   $('.before-box').addClass('hide');
      //   $('.after-box-downloading').removeClass('hide');
      // }

      if (error) {
        console.log('error in getBlobURL. ', error);
      }
      console.log('download link: ' + file.name, url)
      downloadLink(url, torrent.name); // set the button and makes it not invisible
      var link = document.location.hostname + document.location.pathname + '/#' + torrent.infoHash;
      link = link.replace(/\/+/g, '/');

    });
  })
}

// getHash()


// <div class="container">
//       <%- JSON.stringify(currentUser) %>
//       <% include partials/alerts %>
//       <h1>Authentication</h1>
//       <%- body %>
//     </div>
