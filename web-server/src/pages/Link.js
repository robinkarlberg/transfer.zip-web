export default function Link() {
    return (
        <div id="page-outer">
            <div id="page">
                <div>
                    <div id="heading-container" className="container mb-1 d-flex justify-content-between">
                        <div>
                            <h1 className="display-5 fw-medium mb-0">transfer<i>.zip</i></h1>
                            <p className="text-secondary">Free, Fast, Encrypted</p>
                        </div>
                    </div>
                    <main>
                        <div className="container py-2">
                            <p>Linking allows you to send files more easily. By remembering devices, you don't have to
                                create a link or a QR code. Simply choose the recipient from your contact list.
                                This can be reverted at any time.</p>
                            <p>Do you want to link your devices?</p>
                            <form>
                                <fieldset id="file-form-fieldset">
                                    <div className="d-flex flex-wrap">
                                        <div className="">
                                            <input className="btn btn-outline-secondary" type="submit" value="Cancel" />
                                        </div>
                                        <div className="my-auto px-2">
                                            &zwnj;
                                        </div>
                                        <div className="">
                                            <input className="btn btn-primary" type="submit" value="Yes" />
                                        </div>
                                    </div>
                                </fieldset>
                            </form>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    )
}