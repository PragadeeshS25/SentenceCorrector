const sentenceInput = document.getElementById("sentenceInput");
const characterCount = document.getElementById("characterCount");

const checkButton = document.getElementById("checkButton");
const clearButton = document.getElementById("clearButton");

const loading = document.getElementById("loading");
const result = document.getElementById("resultSection");

const originalText = document.getElementById("originalText");
const correctedText = document.getElementById("correctedText");

const grammarCount = document.getElementById("grammarCount");
const spellingCount = document.getElementById("spellingCount");
const styleCount = document.getElementById("styleCount");

const issuesList = document.getElementById("issuesList");

const copyButton = document.getElementById("copyButton");

const correctionMode = document.getElementById("correctionMode");


// ========================================
// CHARACTER COUNT
// ========================================

sentenceInput.addEventListener("input", () => {

    const length = sentenceInput.value.length;

    characterCount.textContent = `${length} / 5000`;

});


// ========================================
// CHECK & CORRECT
// ========================================

checkButton.addEventListener("click", async () => {

    const text = sentenceInput.value.trim();

    // Check empty input
    if (text === "") {

        alert("Please enter a sentence.");

        return;
    }


    // Check maximum length
    if (text.length > 5000) {

        alert("Maximum 5000 characters allowed.");

        return;
    }


    // Get selected mode
    const mode = correctionMode.value;


    // Loading state
    checkButton.disabled = true;
    checkButton.textContent = "Checking...";

    loading.classList.remove("hidden");
    result.classList.add("hidden");


    try {

        // ========================================
        // SEND REQUEST TO BACKEND
        // ========================================

        const response = await fetch(
            "http://localhost:5000/api/correct",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    text: text,
                    mode: mode
                })
            }
        );


        // ========================================
        // CHECK SERVER RESPONSE
        // ========================================

        if (!response.ok) {

            throw new Error(
                `Server error: ${response.status}`
            );

        }


        const data = await response.json();


        // ========================================
        // CHECK API SUCCESS
        // ========================================

        if (!data.success) {

            throw new Error(
                data.message ||
                "Unable to correct the sentence."
            );

        }


        // ========================================
        // DISPLAY ORIGINAL
        // ========================================

        originalText.textContent =
            data.originalText || text;


        // ========================================
        // DISPLAY CORRECTED
        // ========================================

        correctedText.textContent =
            data.correctedText || "";


        // ========================================
        // GET ISSUES
        // ========================================

        const issues =
            Array.isArray(data.issues)
                ? data.issues
                : [];


        // ========================================
        // COUNT ISSUES
        // ========================================

        let grammar = 0;
        let spelling = 0;
        let style = 0;


        issues.forEach((issue) => {

            const type =
                String(issue.type || "")
                    .toLowerCase();


            if (type === "grammar") {
                grammar++;
            }

            else if (type === "spelling") {
                spelling++;
            }

            else if (type === "style") {
                style++;
            }

        });


        // ========================================
        // DISPLAY COUNTS
        // ========================================

        grammarCount.textContent = grammar;
        spellingCount.textContent = spelling;
        styleCount.textContent = style;


        // ========================================
        // DISPLAY ISSUES
        // ========================================

        displayIssues(issues);


        // ========================================
        // SHOW RESULT
        // ========================================

        result.classList.remove("hidden");


        // Scroll to result
        result.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    catch (error) {

        console.error(
            "Sentence correction error:",
            error
        );

        alert(
            "Error: " + error.message
        );

    }

    finally {

        loading.classList.add("hidden");

        checkButton.disabled = false;

        checkButton.textContent =
            "✦ Check & Correct";

    }

});


// ========================================
// DISPLAY ISSUES
// ========================================

function displayIssues(issues) {

    issuesList.innerHTML = "";


    // No issues
    if (issues.length === 0) {

        issuesList.innerHTML = `
            <div class="no-issues">
                ✓ No grammar, spelling, or style issues found.
            </div>
        `;

        return;
    }


    // Display every issue
    issues.forEach((issue) => {

        const issueElement =
            document.createElement("div");

        issueElement.className =
            "issue-item";


        const type =
            String(issue.type || "issue")
                .toLowerCase();


        issueElement.innerHTML = `
            <div class="issue-type">
                ${getIssueIcon(type)}
                ${capitalize(type)}
            </div>

            <div class="issue-content">

                <p>
                    <strong>Original:</strong>
                    ${escapeHTML(issue.original || "")}
                </p>

                <p>
                    <strong>Correction:</strong>
                    ${escapeHTML(issue.correction || "")}
                </p>

                <p>
                    <strong>Why:</strong>
                    ${escapeHTML(issue.explanation || "")}
                </p>

            </div>
        `;


        issuesList.appendChild(issueElement);

    });

}


// ========================================
// COPY CORRECTED TEXT
// ========================================

copyButton.addEventListener("click", async () => {

    const text =
        correctedText.textContent.trim();


    if (!text) {

        alert(
            "There is no corrected text to copy."
        );

        return;
    }


    try {

        await navigator.clipboard.writeText(text);

        const originalButtonText =
            copyButton.textContent;

        copyButton.textContent =
            "✓ Copied!";


        setTimeout(() => {

            copyButton.textContent =
                originalButtonText;

        }, 1500);

    }

    catch (error) {

        console.error(
            "Copy error:",
            error
        );

        alert(
            "Unable to copy the text."
        );

    }

});


// ========================================
// CLEAR
// ========================================

clearButton.addEventListener("click", () => {

    sentenceInput.value = "";

    characterCount.textContent =
        "0 / 5000";

    originalText.textContent = "";

    correctedText.textContent = "";

    grammarCount.textContent = "0";

    spellingCount.textContent = "0";

    styleCount.textContent = "0";

    issuesList.innerHTML = "";

    result.classList.add("hidden");

});


// ========================================
// ISSUE ICON
// ========================================

function getIssueIcon(type) {

    if (type === "grammar") {
        return "📝";
    }

    if (type === "spelling") {
        return "🔤";
    }

    if (type === "style") {
        return "✨";
    }

    return "⚠️";

}


// ========================================
// CAPITALIZE
// ========================================

function capitalize(text) {

    if (!text) {
        return "";
    }

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


// ========================================
// SECURITY
// Escape AI text before inserting into HTML
// ========================================

function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
// ========================================
// PARAPHRASE
// ========================================

const paraphraseButtons =
    document.querySelectorAll(".paraphrase-button");

const paraphraseLoading =
    document.getElementById("paraphraseLoading");

const paraphraseResult =
    document.getElementById("paraphraseResult");

const paraphrasedText =
    document.getElementById("paraphrasedText");

const copyParaphraseButton =
    document.getElementById("copyParaphraseButton");


// ========================================
// PARAPHRASE BUTTONS
// ========================================

paraphraseButtons.forEach((button) => {

    button.addEventListener("click", async () => {

        const text =
            correctedText.textContent.trim();

        const style =
            button.dataset.paraphrase;


        // Check corrected text
        if (!text) {

            alert(
                "Please correct a sentence first."
            );

            return;
        }


        // Disable all paraphrase buttons
        paraphraseButtons.forEach((btn) => {
            btn.disabled = true;
        });


        // Show loading
        paraphraseLoading.classList.remove("hidden");

        paraphraseResult.classList.add("hidden");


        try {

            const response = await fetch(
                "http://localhost:5000/api/paraphrase",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        text: text,
                        style: style
                    })
                }
            );


            if (!response.ok) {

                throw new Error(
                    `Server error: ${response.status}`
                );

            }


            const data =
                await response.json();


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Unable to paraphrase the text."
                );

            }


            // Display paraphrased text
            paraphrasedText.textContent =
                data.paraphrasedText || "";


            // Show result
            paraphraseResult.classList.remove(
                "hidden"
            );


            // Scroll to result
            paraphraseResult.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });

        }

        catch (error) {

            console.error(
                "Paraphrase error:",
                error
            );

            alert(
                "Error: " + error.message
            );

        }

        finally {

            // Hide loading
            paraphraseLoading.classList.add(
                "hidden"
            );


            // Enable buttons
            paraphraseButtons.forEach((btn) => {
                btn.disabled = false;
            });

        }

    });

});


// ========================================
// COPY PARAPHRASED TEXT
// ========================================

copyParaphraseButton.addEventListener(
    "click",
    async () => {

        const text =
            paraphrasedText.textContent.trim();


        if (!text) {

            alert(
                "There is no paraphrased text to copy."
            );

            return;
        }


        try {

            await navigator.clipboard.writeText(
                text
            );


            const originalButtonText =
                copyParaphraseButton.textContent;


            copyParaphraseButton.textContent =
                "✓ Copied!";


            setTimeout(() => {

                copyParaphraseButton.textContent =
                    originalButtonText;

            }, 1500);

        }

        catch (error) {

            console.error(
                "Copy paraphrase error:",
                error
            );

            alert(
                "Unable to copy the text."
            );

        }

    }
);