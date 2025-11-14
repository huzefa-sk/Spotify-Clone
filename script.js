async function getSongs() {
    try {
        let a = await fetch('http://127.0.0.1:3000/Songs/')
        let response = await a.text()
        // console.log(response)
        let div = document.createElement("div")
        div.innerHTML = response
        let as = div.getElementsByTagName("a")
        // console.log(as)
        let songs = []
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href)
            }
        }
        return songs  
    } catch (error) {
         console.error("Song fetch failed ");
        return [];
    }
}


async function main() {
    //Getting the list of all song
    let songs = await getSongs()
    console.log(songs)

    let songUL = document.querySelector(".songList ul")


    for (const path of songs) {
        let filename = decoded(path)

        // Split by last hyphen
        let lastHyphenIndex = filename.lastIndexOf("-");
        let songName = filename.slice(0, lastHyphenIndex).trim();
        let artist = filename.slice(lastHyphenIndex + 1).trim();



        let li = document.createElement("li")
        li.innerHTML = `
        <img class="invert" src="./Image/music.svg" alt="">
        <div class="info">
        <div>${songName}</div>
        <div>${artist}</div>
        </div>
        <div class="playnow">
        <span>Play Now</span>
        <img src="./Image/play.svg" alt="" class="invert">
        </div>
        `;
        li.dataset.songPath = path; // store full song URL
        songUL.appendChild(li)
        // console.log(li)
        li.addEventListener("click", () => {
            document.querySelectorAll(".songList li .playnow img").forEach(img => {
                img.src = "./Image/play.svg"
            })
            const songlistplaybtn = li.querySelector(".playnow img")
            playwithbtn(path)

            songlistplaybtn.src = audio.paused ? "./Image/play.svg" : "./Image/pause.svg";
        })
    }
    
    function decoded(nameURL) {
        let decoded = decodeURIComponent(nameURL)
        // console.log(decoded)
        return decoded.split(/[/\\]/).pop().replace(".mp3", "")
        
    }
    
    function playwithbtn(song) {

        if (currSong !== song) {
            currSong = song
            audio.src = song
            audio.play()
            logo.src = "./Image/pause.svg"
        }
        else {
            if (audio.paused) {
                audio.play()
                logo.src = "./Image/pause.svg"
            } else {
                audio.pause()
                logo.src = "./Image/play.svg";
            }
        }
    }


    const logo = document.querySelector(".songbtn .play-btn")
    const playBtn = document.querySelector(".play-btn")
    playBtn.addEventListener("click", () => {
        if (!currSong) return
        if (audio.paused) {
            audio.play()
        }
        else {
            audio.pause()
        }
        toggleplaybtn(logo)
        const activeLi = document.querySelector(`.songList li[data-song-path="${CSS.escape(currSong)}"]`);
        const liIcon =activeLi.querySelector(".playnow img")
        liIcon.src = audio.paused ? "./Image/play.svg" : "./Image/pause.svg";
        // console.log(activeLi)
    })

    const seekbar = document.querySelector(".seekbar");
    const circle = document.querySelector(".circle");


    let isDragging = false
    //Holfing to  move
    circle.addEventListener("mousedown", e => {
        isDragging = true
        e.stopPropagation()
        audio.pause()
        circle.classList.add("dragging")
    })
    //Lifting mouse to stop
    document.addEventListener("mouseup", e => {
        isDragging = false
        audio.play()
        circle.classList.remove("dragging")
    })
    document.addEventListener("mousemove", e => {
        if (!isDragging || !audio.duration) return
        // Gets the seekbar’s position and size relative to the viewport as an object.
        const rect = seekbar.getBoundingClientRect()
        //e.clinetX is postion of mouse pointer in pixels from left edge of viewport 
        let percent = ((e.clientX - rect.left) / rect.width) * 100
        //To keep circle inside seekbar
        percent = Math.max(0, Math.min(100, percent))

        document.documentElement.style.setProperty("--percentsong", percent + "%")
        audio.currentTime = (percent / 100) * audio.duration
    })

    const currentTimestamp = document.querySelector(".songtime .current")
    const totalDuration = document.querySelector(".songtime .duration")
    const songnameonbar = document.getElementById("Songname")

    audio.addEventListener("timeupdate", () => {
        if (!audio.duration) return;

        const percent = (audio.currentTime / audio.duration) * 100
        document.documentElement.style.setProperty("--percentsong", percent + "%")
        currentTimestamp.textContent = formatTime(audio.currentTime)

    })

    // loadedmetadata fires when the browser has read the audio file’s basic information — duration, sample rate, channels, etc.
    audio.addEventListener("loadeddata", () => {
        totalDuration.textContent = formatTime(audio.duration)
        const str = decoded(audio.src);
        const lastHyphen = str.lastIndexOf("-");
        songnameonbar.textContent = lastHyphen !== -1
            ? `${str.slice(0, lastHyphen)}-by ${str.slice(lastHyphen + 1)}`
            : str;

    })

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${minutes.toString()}:${secs.toString().padStart(2, '0')}`
    }

    const slider = document.getElementById('volumeslider')
    const volumeIcon = document.getElementById('volume-icon')

    slider.addEventListener('input', e => {
        console.log(e.target.value)
        audio.volume = e.target.value
        volumeIcon.src = audio.volume == 0 ? "Image/mute.svg" : "Image/volume.svg";
    })
    
    const menuBurger = document.getElementById("open-menuburger")
    const closeBurger = document.getElementById("closeburger")
    const leftSidebar = document.querySelector('.left');
    menuBurger.addEventListener("click", () => {
        opensidemenu()
    })
    closeBurger.addEventListener("click", () => {
        closesidemenu()
    })
    function opensidemenu() {
        leftSidebar.classList.add("show")
    }
    function closesidemenu() {
        leftSidebar.classList.remove("show")
    }
    document.getElementById("overlay").addEventListener("click", () => {
        closesidemenu()
    })
    function toggleplaybtn(logochange) {
        // console.log(logochange.src)
        if (logochange.src.includes("pause.svg")) {
            logochange.src = "./Image/play.svg"

        }
        else {

            logochange.src = "./Image/pause.svg";
        }
    }


    const prevBtn=document.getElementById("previous-btn")
    const nextBtn=document.getElementById("next-btn")
    const songItems = [...document.querySelectorAll(".songList li")];
    console.log(songItems)
    nextBtn.addEventListener("click",()=>{
        let currentIndex = songItems.findIndex(li=>li.dataset.songPath===currSong)
        let nextIndex=(currentIndex+1)%songItems.length
        let nextLi=songItems[nextIndex]
        let nextSong=nextLi.dataset.songPath
        playwithbtn(nextSong)
    })
    prevBtn.addEventListener("click",()=>{
        let currentIndex = songItems.findIndex(li=>li.dataset.songPath===currSong)
        if (currentIndex === -1) currentIndex = 0;
        let prevIndex=(currentIndex-1+songItems.length)%songItems.length
        let prevLi=songItems[prevIndex]
        let preSong=prevLi.dataset.songPath
        playwithbtn(preSong)
    })
}

const audio = new Audio()
let currSong = null


main()
