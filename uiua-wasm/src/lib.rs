use wasm_bindgen::prelude::*;
use uiua::Uiua;
use uiua::format::{format_str, FormatConfig};

#[wasm_bindgen(start)]
pub fn init() {
    // Set up better panic messages in console
    console_error_panic_hook::set_once();
}

/// Format Uiua code (convert ASCII names to Unicode symbols)
/// Returns: { "success": bool, "formatted": string, "output": string }
#[wasm_bindgen]
pub fn format_uiua(code: &str) -> String {
    let config = FormatConfig::default();
    
    match format_str(code, &config) {
        Ok(format_output) => {
            serde_json::json!({
                "success": true,
                "formatted": format_output.output,
                "output": ""
            }).to_string()
        }
        Err(e) => {
            serde_json::json!({
                "success": false,
                "formatted": code,
                "output": e.to_string()
            }).to_string()
        }
    }
}

/// Evaluate Uiua code and return the result as a JSON string
/// Returns: { "success": bool, "output": string, "stack": array, "formatted": string }
#[wasm_bindgen]
pub fn eval_uiua(code: &str) -> String {
    // First, format the code to get the Unicode version
    let config = FormatConfig::default();
    let formatted = match format_str(code, &config) {
        Ok(fo) => fo.output,
        Err(_) => code.to_string(),
    };
    
    let mut env = Uiua::with_safe_sys();
    
    match env.run_str(code) {
        Ok(_compiler) => {
            // Get the stack values and format them
            let stack = env.take_stack();
            let output: Vec<String> = stack.iter().map(|v| v.to_string()).collect();
            let output_str = output.join("\n");
            
            serde_json::json!({
                "success": true,
                "output": output_str,
                "stack": output,
                "formatted": formatted
            }).to_string()
        }
        Err(e) => {
            serde_json::json!({
                "success": false,
                "output": e.to_string(),
                "stack": [],
                "formatted": formatted
            }).to_string()
        }
    }
}

/// Get the Uiua version
#[wasm_bindgen]
pub fn uiua_version() -> String {
    uiua::VERSION.to_string()
}
