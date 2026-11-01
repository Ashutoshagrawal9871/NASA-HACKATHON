#include<iostream>
using namespace std;
class example
{
   public:
   example(void)
   {
    cout<<"constructor is called"<<endl;
   }
   
   ~example(void);
   };
   example :: ~example(void)
   {
    cout<<"destructor is called "<<endl;
   }
   int main(){
    example ex;
    return 0;
   }
    