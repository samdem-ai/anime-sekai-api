function pad(num, size) {
    var s = "00000000000" + num;
    return s.substr(s.length - size);
}


async function fetchEpisode(episode) {
    const result = fetch(`https://api.animeiat.co/public/v1/episode/${episode}`)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('something went wrong')
        })
        .then((data) => {
            return data;
        })
        .catch((e) => {
            console.log(e);
        });
    return result;
}


export default async function handler(req, res) {
    const { episode } = req.query;
    const searchResult = await fetchEpisode(episode);

    if (searchResult) {
        let title = searchResult
            .data
            .title
            .replaceAll('(', 'openingPar')
            .replaceAll(')', 'closingPar')
            .replaceAll(',', 'uneVirgule')
            .replaceAll('♀', 'uneWoman')
            .replaceAll(':', '')
            .replaceAll('.', 'dotPoint')
            .replaceAll('-', 'sixLine')
            .replaceAll(/[\W_]+/g, " ");

        let epTitleNumber

        if (searchResult.data.anime.type !== 'movie') {

            if (title.split(" ")[title.split(" ").length - 2].length === 1) {
                epTitleNumber =
                    "-_EP" + pad(title.split(" ")[title.split(" ").length - 2], 2);
            } else {
                epTitleNumber =
                    "-_EP" + title.split(" ")[title.split(" ").length - 2];
            }

            title = title.split(" ");
            title.pop();
            title[title.length - 1] = epTitleNumber;

        } else {

            epTitleNumber = '-_MOVIE'
            title = title.split(" ");
            title.pop();
            title[title.length] = epTitleNumber;
        }

        const toFilter = ['']
        title = title.filter(item => !toFilter.includes(item))
        let newTitle = ""
        title.forEach(e => {
            newTitle += e
            newTitle += '_'
        });

        newTitle = newTitle
            .replaceAll('openingPar', '(')
            .replaceAll('dotPoint', '.')
            .replaceAll('closingPar', ')')
            .replaceAll('uneWoman', '♀')
            .replaceAll('uneVirgule', '%2C')
            .replaceAll('sixLine', '-')



        const videoId = searchResult.data.video_id;

        const epLinks = {
            title: `${searchResult.data.title}`,
            thumbnail: `https://api.animeiat.co/storage/${searchResult.data.poster_path}`,
            "360p": `https://cdn.animeiat.tv/files/${videoId}/%5BAnimeiat.co%5D${newTitle}%5B360p%5D.mp4`,
            "480p": `https://cdn.animeiat.tv/files/${videoId}/%5BAnimeiat.co%5D${newTitle}%5B480p%5D.mp4`,
            "720p": `https://cdn.animeiat.tv/files/${videoId}/%5BAnimeiat.co%5D${newTitle}%5B720p%5D.mp4`,
            "1080p": `https://cdn.animeiat.tv/files/${videoId}/%5BAnimeiat.co%5D${newTitle}%5B1080p%5D.mp4`,
            "backup": `https://api.animeiat.co/storage/videos/[Animeiat.co]${newTitle.replaceAll('_', ' ')}.mp4`
        };

        const result360 = fetch(epLinks['360p'])
            .then((response) => {
                if (response.ok) {
                    return 'ok'
                }
                return 'error'
            })
        const result480 = fetch(epLinks['480p'])
            .then((response) => {
                if (response.ok) {
                    return 'ok'
                }
                return 'error'
            })
        const result720 = fetch(epLinks['720p'])
            .then((response) => {
                if (response.ok) {
                    return 'ok'
                }
                return 'error'
            })
        const result1080 = fetch(epLinks['1080p'])
            .then((response) => {
                if (response.ok) {
                    return 'ok'
                }
                return 'error'
            })
        if (result360 === 'error') {
            epLinks['360p'] = ''
        }
        if (await result480 === 'error') {
            epLinks['360p'] = ''
        }
        if (await result720 === 'error') {
            epLinks['720p'] = ''
        }
        if (await result1080 === 'error') {
            epLinks['1080p'] = ''
        }

        console.log(epLinks)
        res.status(200).json(epLinks)
    } else {
        res.status(404).send('oh noo something went wrong');
    }
}
