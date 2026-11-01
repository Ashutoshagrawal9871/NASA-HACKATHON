#include<iostream>
using namespace std;
class example{
   public:
   //constructor is called
   example(void){
    cout<<"constructor is called"<<endl;
   }
   //definning the destructor
   ~ example(void)
   {
    cout<<"destructor is called";
   }
};
   int main(){
    example ex;
    return 0;
   }
   


