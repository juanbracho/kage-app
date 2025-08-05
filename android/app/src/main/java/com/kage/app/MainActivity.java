package com.kage.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Configure WebView for enhanced text input and autocorrect
        configureWebViewForTextCorrection();
    }
    
    private void configureWebViewForTextCorrection() {
        // Get the WebView from Capacitor
        WebView webView = getBridge().getWebView();
        
        if (webView != null) {
            WebSettings webSettings = webView.getSettings();
            
            // Enable text auto-correction features
            webSettings.setJavaScriptEnabled(true);
            webSettings.setDomStorageEnabled(true);
            
            // Allow file access for better text input handling
            webSettings.setAllowFileAccess(true);
            webSettings.setAllowContentAccess(true);
            
            // Enable hardware acceleration for better text input performance
            webView.setLayerType(WebView.LAYER_TYPE_HARDWARE, null);
            
            // Configure WebView to work better with Android input methods
            webView.setFocusable(true);
            webView.setFocusableInTouchMode(true);
            
            // Enable text selection and input method corrections
            webView.setTextDirection(WebView.TEXT_DIRECTION_LOCALE);
        }
    }
}
