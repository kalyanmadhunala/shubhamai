package com.shubhamai

import android.content.ClipData
import android.content.Intent
import android.content.pm.PackageManager
import androidx.core.content.FileProvider

import com.facebook.react.bridge.*

import java.io.File

class ShareToAIModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ShareToAI"
    }

    // ─────────────────────────────────────────
    // CHECK APP INSTALLED
    // ─────────────────────────────────────────

    @ReactMethod
    fun isAppInstalled(
        packageName: String,
        promise: Promise
    ) {

        try {

            val pm =
                reactContext.packageManager

            pm.getPackageInfo(
                packageName,
                PackageManager.GET_ACTIVITIES
            )

            promise.resolve(true)

        } catch (e: Exception) {

            promise.resolve(false)
        }
    }

    // ─────────────────────────────────────────
    // SHARE IMAGE + TEXT
    // ─────────────────────────────────────────

    @ReactMethod
    fun shareToApp(
        packageName: String,
        imagePath: String,
        prompt: String,
        promise: Promise
    ) {

        try {

            // Remove file://
            val cleanPath =
                imagePath.replace(
                    "file://",
                    ""
                )

            val imageFile =
                File(cleanPath)

            if (!imageFile.exists()) {

                promise.reject(
                    "FILE_NOT_FOUND",
                    "Image file does not exist"
                )

                return
            }

            // Secure URI
            val imageUri =
                FileProvider.getUriForFile(
                    reactContext,
                    reactContext.packageName + ".provider",
                    imageFile
                )

            // Share Intent
            val intent =
                Intent(Intent.ACTION_SEND)

            // Open specific app
            intent.setPackage(packageName)

            // Image
            intent.putExtra(
                Intent.EXTRA_STREAM,
                imageUri
            )

            // Caption / Prompt
            intent.putExtra(
                Intent.EXTRA_TEXT,
                prompt
            )

            // Subject
            intent.putExtra(
                Intent.EXTRA_SUBJECT,
                "AI Poster Prompt"
            )

            // IMPORTANT:
            // WhatsApp requires image/*
            intent.type = "image/*"

            // URI Support
            intent.clipData =
                ClipData.newRawUri(
                    "",
                    imageUri
                )

            // Permissions
            intent.addFlags(
                Intent.FLAG_GRANT_READ_URI_PERMISSION
            )

            intent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
            )

            // Launch
            reactContext.startActivity(intent)

            promise.resolve(true)

        } catch (e: Exception) {

            e.printStackTrace()

            promise.reject(
                "SHARE_ERROR",
                e.message
            )
        }
    }

    // ─────────────────────────────────────────
    // SHARE TEXT ONLY
    // ─────────────────────────────────────────

    @ReactMethod
    fun shareTextToApp(
        packageName: String,
        prompt: String,
        promise: Promise
    ) {

        try {

            val intent =
                Intent(Intent.ACTION_SEND)

            intent.setPackage(packageName)

            intent.putExtra(
                Intent.EXTRA_TEXT,
                prompt
            )

            intent.type = "text/plain"

            intent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
            )

            reactContext.startActivity(intent)

            promise.resolve(true)

        } catch (e: Exception) {

            e.printStackTrace()

            promise.reject(
                "TEXT_SHARE_ERROR",
                e.message
            )
        }
    }
}