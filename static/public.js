/* CmdRunner — Public-Facing JS

Loaded on all pages. Provides client-side enhancements.
Functions from AWS public.js + js.js consolidated.
*/

// ─── Loading Spinner ──────────────────────────────────────
function loading() {
    const el = document.querySelector(".full-page-loading");
    if (el) el.style.display = "grid";
}

function stop_loading() {
    const el = document.querySelector(".full-page-loading");
    if (el) el.style.display = "none";
}

// ─── Alert Dialog ─────────────────────────────────────────
function show_alert( message, type = "info" ) {
    const alert_box = document.createElement("div");
    alert_box.className = `alert ${type}`;
    alert_box.innerHTML = `
        <p class="message">${message}</p>
        <button class="close-alert">Close</button>
    `;

    const alert_count = document.querySelectorAll(".alert").length;
    alert_box.style.marginLeft = alert_count * 30 + "px";
    alert_box.style.marginTop = alert_count * 30 + "px";

    document.body.appendChild(alert_box);
}

// ─── Prompt Dialog ────────────────────────────────────────
function show_prompt( title, message, choices, settings ) {
    const prompt_box = document.createElement("div");
    prompt_box.className = "alert prompt";

    if( settings && settings.class ) {
        prompt_box.className += " " + settings.class;
    }

    prompt_box.innerHTML = `
        <div class="title">${title}</div>
        <p class="message">${message}</p>
        <div class="buttons"></div>
    `;

    const prompt_count = document.querySelectorAll(".alert.prompt").length;
    prompt_box.style.marginTop = (prompt_count * 30) + "px";
    prompt_box.style.marginLeft = (prompt_count * 30) + "px";

    const buttons_container = prompt_box.querySelector(".buttons");

    for( const [label, action] of Object.entries(choices) ) {
        const button = document.createElement("button");
        const parts = label.split("|");
        if( parts.length > 1 ) {
            button.classList.add(parts[1]);
        }
        button.textContent = parts[0];
        button.addEventListener("click", e => {
            action( prompt_box );
            prompt_box.remove();
        });
        buttons_container.appendChild(button);
    }

    document.body.appendChild(prompt_box);

    if( settings && settings.timeout ) {
        setTimeout( function() {
            prompt_box.remove();
        }, settings.timeout );
    }
}

// ─── Keyboard: Enter to dismiss alerts ────────────────────
document.body.addEventListener("keydown", event => {
    const alert_box = document.querySelector(".alert");
    if( alert_box ) {
        if( event.key === "Enter" ) {
            event.preventDefault();
            alert_box.querySelector(".buttons button").click();
        }
    }
});

// ─── Click to close alerts ────────────────────────────────
document.body.addEventListener("click", event => {
    if( event.target.classList.contains("close-alert") ) {
        const alert_box = event.target.closest(".alert");
        if( alert_box ) {
            alert_box.remove();
        }
    }
});

// ─── Local Datetime Formatting ────────────────────────────
document.querySelectorAll('.localtime, .localtime-seconds, .localdate, .localdatetime, .localdatetime-seconds').forEach(el => {
    let value;
    if( el.tagName === 'INPUT' ) {
        value = el.value;
    } else {
        value = el.textContent;
    }

    let utcString = value.trim();

    if( ! utcString.endsWith('Z') && !utcString.includes('+') ) {
        utcString += 'Z';
    }

    const date = new Date(utcString);

    if( ! isNaN( date ) ) {
        const pad = (n) => n.toString().padStart(2, '0');

        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1);
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());

        let format = `${year}-${month}-${day} ${hours}:${minutes}`;
        if( el.classList.contains("localtime") ) {
            format = `${hours}:${minutes}`;
        } else if( el.classList.contains("localtime-seconds") ) {
            format = `${hours}:${minutes}:${seconds}`;
        } else if( el.classList.contains("localdate") ) {
            format = `${year}-${month}-${day}`;
        } else if( el.classList.contains("localdatetime") ) {
            format = `${year}-${month}-${day} ${hours}:${minutes}`;
        } else if( el.classList.contains("localdatetime-seconds") ) {
            format = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        if( el.tagName === 'INPUT' ) {
            el.value = format;
        } else {
            el.textContent = format;
        }
    } else {
        console.warn("Invalid date:", utcString);
    }
});

// ─── Admin / Trial Toggle ─────────────────────────────────
document.addEventListener("change", function(e) {
    if( e.target.closest(".admin-toggle") ) {
        if( e.target.checked ) {
            document.querySelectorAll(".hide-for-admin").forEach(el => {
                el.classList.add("hidden");
            });
        } else {
            document.querySelectorAll(".hide-for-admin").forEach(el => {
                el.classList.remove("hidden");
            });
        }
    }

    if( e.target.closest(".trial-toggle") ) {
        if( e.target.checked ) {
            document.querySelectorAll(".show-for-trial").forEach(el => {
                el.classList.remove("hidden2");
            });
        } else {
            document.querySelectorAll(".show-for-trial").forEach(el => {
                el.classList.add("hidden2");
            });
        }
    }
});

// ─── Post to Page (form submission helper) ────────────────
function post_to_page( url, data = {} ) {
    loading();
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = url;

    for( const key in data ) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
}

// ─── Test Suite Editor ────────────────────────────────────

const testCasesContainer = document.getElementById("test-cases-list");

const templates = {
    testCase: document.getElementById("template-test-case")?.innerHTML,
    step: document.getElementById("template-step")?.innerHTML,
};

function add_test_case() {
    if( !testCasesContainer || !templates.testCase ) return;
    testCasesContainer.insertAdjacentHTML("beforeend", templates.testCase);

    add_step( [...document.querySelectorAll(".test-case-fieldset")].pop() );

    update_numbers();
}

function add_step( element ) {
    if( !element || !templates.step ) return;
    const testCase = element.closest(".test-case-fieldset");
    const stepsContainer = testCase.querySelector(".steps");

    stepsContainer.insertAdjacentHTML("beforeend", templates.step);

    update_numbers();
}

function update_numbers() {
    let test_case_number = 1;

    document.querySelectorAll( ".test-case-fieldset" ).forEach( test_case => {
        test_case.querySelector(".test-case-number").textContent = "#" + (test_case_number++);

        let step_number = 1;
        test_case.querySelectorAll( ".step-fieldset" ).forEach( step => {
            step.querySelector(".step-number").textContent = "#" + (step_number++);
        } );
    } );
}

function make_test_suite_json() {
    const test_suite = {
        name: document.querySelector("#test-suite-name")?.value,
        id: document.querySelector("#test-suite-id")?.value,
        test_cases: [],
    };

    document.querySelectorAll( ".test-case-fieldset" ).forEach( test_case => {
        const test_case_json = {
            name: test_case.querySelector(".test-case-name").value,
            url: test_case.querySelector(".test-case-url")?.value,
            id: test_case.querySelector(".test-case-id")?.value,
            steps: [],
        };

        test_case.querySelectorAll( ".step-fieldset" ).forEach( step => {
            test_case_json.steps.push( {
                name: step.querySelector(".step-name").value,
                expectation: step.querySelector(".step-expectation").value,
                notes: step.querySelector(".step-notes").value,
                id: step.querySelector(".step-id")?.value,
            } );
        } );

        test_suite.test_cases.push( test_case_json );
    } );

    return test_suite;
}

// ─── Test Suite Editor Event Listeners ────────────────────
document.addEventListener("DOMContentLoaded", function() {
    const addTestCaseBtn = document.querySelector(".js-add-testcase");
    if( addTestCaseBtn ) {
        addTestCaseBtn.addEventListener("click", add_test_case);
    }

    if( testCasesContainer ) {
        testCasesContainer.addEventListener("click", (e) => {
            // Add Step
            if( e.target.classList.contains("js-add-step") ) {
                add_step( e.target );
            }

            // Remove Step
            if( e.target.classList.contains("js-remove-step") ) {
                show_prompt( "Delete step", "Are you sure you want to delete this step?", {
                    "Delete|danger": () => {
                        e.target.closest(".step-fieldset").remove();
                        update_numbers();
                    },
                    "Cancel": () => {}
                }, {class: "danger"} );
            }

            // Remove Test Case
            if( e.target.classList.contains("js-remove-testcase") ) {
                show_prompt( "Delete test case", "Are you sure you want to delete this test case?", {
                    "Delete|danger": () => {
                        e.target.closest(".test-case-fieldset").remove();
                        update_numbers();
                    },
                    "Cancel": () => {}
                }, {class: "danger"} );
            }

            // Toggle Expectation and Notes
            if( e.target.classList.contains("js-add-expectation-and-notes") ) {
                const exp_and_notes = e.target.closest(".step-fieldset").querySelector(".expectation-and-notes");

                if( exp_and_notes.style.display !== "block" ) {
                    e.target.textContent = "- Hide Expectation & Notes";
                    exp_and_notes.style.display = "block";
                } else {
                    e.target.textContent = "+ Show Expectation & Notes";
                    exp_and_notes.style.display = "none";
                }

                e.preventDefault();
            }
        });
    }

    // Test suite form submit
    const testSuiteForm = document.querySelector(".test-suite-form");
    if( testSuiteForm ) {
        testSuiteForm.addEventListener("submit", async e => {
            e.preventDefault();

            const response = await fetch(e.target.action, {
                method: e.target.method,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify( make_test_suite_json() ),
            });

            let response_json;

            try {
                response_json = await response.json();
            } catch( e ) {
                show_alert( "Error saving test suite" );
                return false;
            }

            if( ! response.ok || response_json.error ) {
                if( response_json.error ) {
                    show_alert( response_json.error );
                } else {
                    show_alert( "Error saving test suite" );
                }
                return false;
            }

            if( response_json.redirect ) {
                document.location.href = response_json.redirect;
            } else {
                show_alert( "Test suite saved" );
            }
        });
    }
});

// ─── Upload Test Suite File ───────────────────────────────
async function upload_test_suite_file( test_suite_file, load_func = null, stop_load_func = null ) {
    const file = test_suite_file.files[0];
    if( ! file ) {
        show_alert( "Please select a file first." );
        return false;
    }

    if( load_func ) load_func();

    test_suite_file.value = "";

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/upload_test_suite_file", {
        method: "POST",
        body: formData
    });

    if( ! response.ok ) {
        if( stop_load_func ) stop_load_func();
        const error = await response.json();
        if( error.error ) {
            show_alert( error.error );
        } else {
            show_alert( "Error uploading file" );
        }
        return false;
    }

    const response_json = await response.json();

    if( response_json.error ) {
        if( stop_load_func ) stop_load_func();
        if( response_json.error ) {
            show_alert( response_json.error );
        } else {
            show_alert( "Error uploading file" );
        }
        return false;
    }

    return response_json;
}

// ─── Create Test Suite ────────────────────────────────────
async function create_test_suite( test_suite ) {
    const response = await fetch("/test_suites/new", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify( test_suite )
    });

    try {
        if( ! response.ok ) {
            const error = await response.json();
            show_alert( "Error creating test suite: " + error.error );
            return false;
        }

        const response_json = await response.json();
        if( response_json.error ) {
            show_alert( "Error creating test suite: " + response_json.error );
            return false;
        }

        return response_json.id;
    } catch( error ) {
        show_alert( "Error creating test suite" );
        return;
    }
}