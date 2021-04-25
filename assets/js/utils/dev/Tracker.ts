class Tracker {
    update(infos: any) {
        const linesCounter = document.querySelector( '#linesCounter') as HTMLElement
        const pointsCounter = document.querySelector( '#pointsCounter') as HTMLElement
        const trianglesCounter = document.querySelector( '#trianglesCounter') as HTMLElement

        if (!linesCounter || !pointsCounter || !trianglesCounter || !infos) {
            return
        }

        linesCounter.textContent = infos.lines
        pointsCounter.textContent = infos.points
        trianglesCounter.textContent = infos.triangles
    }
}

export default new Tracker() as Tracker