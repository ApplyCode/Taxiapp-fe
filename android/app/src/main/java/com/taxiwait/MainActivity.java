package com.taxiwait;
import android.os.Bundle; // here 

import com.facebook.react.ReactActivity;
import org.devio.rn.splashscreen.SplashScreen; // here 
import com.github.wumke.RNImmediatePhoneCall.RNImmediatePhoneCallPackage;  // <--- import

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "taxiwait";
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
      SplashScreen.show(this);  // here 
      super.onCreate(savedInstanceState);
  }

  @Override
  public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
      RNImmediatePhoneCallPackage.onRequestPermissionsResult(requestCode, permissions, grantResults); // very important event callback
      super.onRequestPermissionsResult(requestCode, permissions, grantResults);
  }  
}
