'use strict'

//pass your tawk.to propertyId
export default function tawkTo(propertyId: any, email: string, name: string) {
    if (!window) {
        throw new Error('DOM is unavailable')
    }
    // @ts-ignore
    window.Tawk_API = window.Tawk_API || {}

    // @ts-ignore
    window.Tawk_LoadStart = new Date()

    // pass attributes to tawk.to
    // @ts-ignore
    window.Tawk_API.onLoad =  () => {
        // @ts-ignore
        window.Tawk_API.setAttributes(
            {
                name,
                email
            },
            // @ts-ignore
            (error) => {
                console.log(error)
            }
        )
    }


    const tawk = document.getElementById('tawkId')
    if (tawk) {
        // Prevent TawkTo to create root script if it already exists
        // @ts-ignore
        return window.Tawk_API
    }

    const script = document.createElement('script')
    script.id = 'tawkId'
    script.async = true
    script.src = `https://embed.tawk.to/${propertyId}/1fo450msl`
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')

    const first_script_tag = document.getElementsByTagName('script')[0]
    if (!first_script_tag || !first_script_tag.parentNode) {
        throw new Error('DOM is unavailable')
    }

    first_script_tag.parentNode.insertBefore(script, first_script_tag)
}