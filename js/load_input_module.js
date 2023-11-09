var loadGalery = (function() {

    // generate guid
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    }

    // var defaultOptions = {
    //     wrapClassPrefix: "",
    //     containerInputClassPrefix: "",
    //     isMulti:"",
    //     isAlbum
    //     isAddAlbum
    //     isInput
    // }
    // 
    var defaultOptions = {};

    function inputEventListener() {
        defaultOptions.files = this.files;

        defaultOptions.imagesContainer = this.parentNode.nextSibling;

        if (!defaultOptions.isMulti) {
            defaultOptions.imagesContainer.innerHTML = "";
        }

        if (defaultOptions.files.length > 0) {
            for (var i = 0, length = defaultOptions.files.length; i < length; i++) {
                this.previousElementSibling.innerText = defaultOptions.files[i].name;
                addFile(defaultOptions.files[i]);
            }
        } else {
            this.previousElementSibling.innerText = defaultOptions.files[0].name;
            addFile(defaultOptions.files[0]);
        }
    }

    /**
     * Add input to parent
     * @param {object} options Options
     */
    function addInput(options) {
        var divWrap = document.createElement("div");
        divWrap.classList.add(options.divWrapPrefix);

        var spanButtonName = document.createElement("span");
        spanButtonName.classList.add(options.divWrapPrefix + "-button");
        if (options.text.inputFileButton) {
            spanButtonName.appendChild(document.createTextNode(options.text.inputFileButton));
        } else {
            spanButtonName.appendChild(document.createTextNode("Обзор:"));
        }

        var divFileName = document.createElement("div");
        divFileName.classList.add(options.divWrapPrefix + "-text");
        if (options.text.inputFileChoose) {
            divFileName.appendChild(document.createTextNode(options.text.inputFileChoose));
        } else {
            divFileName.appendChild(document.createTextNode("Файл не выбран"));
        }

        var inputFile = document.createElement("input");
        inputFile.type = "file";
        inputFile.classList.add(options.divWrapPrefix + "-field");

        // add event listener to input
        if (defaultOptions.isPreview) {
            inputFile.addEventListener("change", inputEventListener);
        } else {
            inputFile.addEventListener("change", function() {
                options.files = this.files;
                if (this.files.length > 0) {
                    for (var i = 0, length = this.files.length; i < length; i++) {
                        this.previousElementSibling.innerText = this.files[i].name;
                    }
                } else {
                    this.previousElementSibling.innerText = this.files[0].name;
                }
            })
        }

        if (options.isMulti) {
            inputFile.setAttribute("multiple", true);
        }

        divWrap.appendChild(spanButtonName);
        divWrap.appendChild(divFileName);
        divWrap.appendChild(inputFile);

        options.parent.appendChild(divWrap);

        return this;
    };

    /**
     * Add preview div with options
     * @param {Object} options Options
     */
    function addPreviewContainer(options) {
        var divWrap = document.createElement("div");
        divWrap.classList.add(options.prevContainerPrefix);

        options.parent.appendChild(divWrap);

        return this;
    };

    /**
     * Add album div with options
     * @param {Object} options Options
     */
    function addAlbum(options) {
        var nameId = guid();

        var divWrapAlbumTitle = document.createElement("div");
        divWrapAlbumTitle.classList.add(options.albumPrefixTitleWrap);

        if (options.isAlbumDelete) {
            var spanAlbumDelete = document.createElement("span");
            spanAlbumDelete.classList.add(options.albumPrefixTitleWrap + "-del");
            if (options.text.deleteAlbumButton) {
                spanAlbumDelete.appendChild(document.createTextNode(options.text.deleteAlbumButton));
            } else {
                spanAlbumDelete.appendChild(document.createTextNode("Удалить альбом"));
            }
            spanAlbumDelete.addEventListener("click", function() {
                var container = this.parentNode.parentNode;

                container.parentNode.removeChild(container);
            });
            divWrapAlbumTitle.appendChild(spanAlbumDelete);
        }

        var albumTitle = document.createElement("h4");

        var string = "Альбом";
        albumTitle.appendChild(document.createTextNode("Альбом"));

        divWrapAlbumTitle.appendChild(albumTitle);

        options.parent.appendChild(divWrapAlbumTitle);

        var albumWrap = document.createElement("div");
        albumWrap.classList.add(options.albumPrefixWrap);

        var albumInput = document.createElement("input");
        albumInput.classList.add(options.albumPrefixWrap + "-field");
        albumInput.type = "text";
        albumInput.addEventListener("keydown", function(event) {
            if (this.value.length > 1) {
                albumTitle.innerText = this.value;
            } else {
                albumTitle.innerText = "Альбом";
            }
        });

        if (options.isAlbumLabelNested) {
            var labelAlbum = document.createElement("label");
            labelAlbum.classList.add(options.albumPrefixWrap + "-label");
            if (options.text.albumLabelText) {
                labelAlbum.appendChild(document.createTextNode(options.text.albumLabelText));
            }

            albumInput.name = options.albumPrefixWrap + "-" + nameId;

            labelAlbum.htmlFor = options.albumPrefixWrap + "-" + nameId;

            albumWrap.appendChild(labelAlbum);
        }

        if (options.text.albumInputPlaceholder && options.isAlbumPlaceholder) {
            albumInput.setAttribute("placeholder", options.text.albumInputPlaceholder);
        };

        albumWrap.appendChild(albumInput);

        options.parent.appendChild(albumWrap);

        return this;
    };

    function addFile(file) {
        var divWrap = document.createElement("div");
        divWrap.classList.add(defaultOptions.prevContainerPrefix + "-item");

        var span = document.createElement("span");
        span.classList.add(defaultOptions.prevContainerPrefix + "-del");

        // add click event listener
        span.addEventListener("click", function(event) {
            var div = this.parentNode;
            div.parentNode.removeChild(div);
        });

        if (file.type == "image/jpeg" || file.type == "image/jpg" || file.type == "image/gif" || file.type == "image/png") {
            // add new filereader
            var reader = new FileReader();
            reader.onload = function(e) {
                var image = document.createElement("img");
                image.src = e.target.result;

                // add image and span to div
                divWrap.appendChild(image);
                divWrap.appendChild(span);

                // add div to images imageContainer
                defaultOptions.imagesContainer.appendChild(divWrap);
            }

            // read input file as base64 string
            reader.readAsDataURL(file);
        } else if (file.type == "video/mp4") {
            divWrap.appendChild(document.createTextNode(file.name));

            // add image and span to div
            divWrap.appendChild(span);

            // add div to images imageContainer
            defaultOptions.imagesContainer.appendChild(divWrap);
        } else {
            var string = file.type + " : " + file.name;
            divWrap.appendChild(document.createTextNode(string));

            // add image and span to div
            divWrap.appendChild(span);

            // add div to images imageContainer
            defaultOptions.imagesContainer.appendChild(divWrap);
        };

        return this;
    }

    function render(options) {
        if (options.isAddAlbum) {
            var spanAdd = document.createElement("span");
            spanAdd.classList.add("edit__step-add");
            if (options.text.addAlbumSpan) {
                spanAdd.appendChild(document.createTextNode(options.text.addAlbumSpan));
            } else {
                spanAdd.appendChild(document.createTextNode("Добавить альбом"));
            };
            spanAdd.addEventListener("click", function() {
                options.isAddAlbum = false;
                options.isPrepend = true;
                render(options);
            })

        }

        var divWrap = document.createElement("div");
        divWrap.classList.add("edit__step-album");

        options.parent = divWrap;

        if (options.isAlbum) {
            addAlbum(options);
        }

        addInput(options);

        if (options.isPreview) {
            addPreviewContainer(options);
        }

        if (options.isPrepend) {
            options.element.insertBefore(divWrap, options.element.lastChild);
        } else {
            options.element.appendChild(divWrap);
        }



        if (options.isAddAlbum) {
            options.element.appendChild(spanAdd);
        }
        return this;
    };

    /**
     * Init module with options
     * @param  {Object} options Options
     * @return {Object}         Module
     */
    function init(options) {
        if (options) {
            defaultOptions = options;
        } else {
            return this;
        }
        render(options);


        return this;
    };

    return {
        options: defaultOptions,
        init: init,
        addInput: addInput,
        addPreviewContainer: addPreviewContainer,
        addAlbum: addAlbum,
        // add(options)
    }

}());

window.loadGalery = loadGalery;